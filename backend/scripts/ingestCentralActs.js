const API_BASE = "https://indiacode.ecourtsindia.com/api/v1";

const db = require("../db");
const crypto = require("crypto");

const REQUEST_DELAY_MS = 100;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status} for ${url}\n${text}`
        );
    }

    return JSON.parse(text);
}

function sha256(text) {
    return crypto
        .createHash("sha256")
        .update(text || "", "utf8")
        .digest("hex");
}

async function getCentralActs() {
    const url =
        `${API_BASE}/acts?jurisdiction=central&limit=1000`;

    console.log("Fetching Central Acts...");
    const data = await fetchJson(url);

    const acts = data.acts || [];

    console.log(`Found ${acts.length} Central Acts.`);

    return acts;
}

async function ingestAct(act) {
    console.log(
        `\n========================================`
    );

    console.log(
        `ACT: ${act.short_title || act.id}`
    );

    console.log(
        `ID: ${act.id}`
    );

    console.log(
        `Sections: ${act.section_count || 0}`
    );

    if (!act.in_force) {
        console.log("Skipping: Act is not in force.");
        return {
            inserted: 0,
            updated: 0,
            skipped: 0
        };
    }

    const actUrl =
        `${API_BASE}/acts/${encodeURIComponent(act.id)}`;

    let actData;

    try {
        actData = await fetchJson(actUrl);
    } catch (error) {
        console.error(
            `Failed to fetch Act ${act.id}:`,
            error.message
        );

        return {
            inserted: 0,
            updated: 0,
            skipped: 0
        };
    }

    const sections = actData.sections || [];

    console.log(
        `API returned ${sections.length} sections.`
    );

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const section of sections) {

        const sectionNumber = String(
            section.number || ""
        ).trim();

        if (!sectionNumber) {
            continue;
        }

        const sectionUrl =
            section.url?.startsWith("http")
                ? section.url
                : `https://indiacode.ecourtsindia.com${section.url}`;

        let sectionData;

        try {
            sectionData =
                await fetchJson(
                    `${API_BASE}/${act.id}/section/${encodeURIComponent(sectionNumber)}`
                );
        } catch (error) {
            console.error(
                `Failed section ${sectionNumber}:`,
                error.message
            );

            continue;
        }

        const sectionInfo =
            sectionData.section || {};

        const content =
            (sectionInfo.text || "").trim();

        if (!content) {
            console.log(
                `Skipping section ${sectionNumber}: no text`
            );
            skipped++;
            continue;
        }

        const title =
            sectionInfo.heading ||
            section.heading ||
            null;

        const contentHash =
            sha256(content);

        const actName =
            act.short_title ||
            actData.act?.short_title ||
            act.id;

        const actNumber =
            act.act_number ||
            actData.act?.act_number ||
            null;

        const effectiveDate =
            act.enforcement_date ||
            actData.act?.enforcement_date ||
            null;

        const sourceVersion =
            String(
                act.act_year ||
                actData.act?.act_year ||
                ""
            );

        const sourceUrl =
            sectionData.url ||
            sectionUrl;

        const [existingRows] =
            await db.query(
                `
                SELECT
                    id,
                    content_hash
                FROM legal_knowledge
                WHERE act_name = ?
                  AND section_number = ?
                LIMIT 1
                `,
                [
                    actName,
                    sectionNumber
                ]
            );

        if (existingRows.length === 0) {

            await db.query(
                `
                INSERT INTO legal_knowledge (
                    act_name,
                    act_number,
                    section_number,
                    section_title,
                    content,
                    source_name,
                    source_url,
                    effective_date,
                    source_version,
                    content_hash
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    actName,
                    actNumber,
                    sectionNumber,
                    title,
                    content,
                    "eCourts India / India Code",
                    sourceUrl,
                    effectiveDate,
                    sourceVersion,
                    contentHash
                ]
            );

            inserted++;

            console.log(
                `INSERTED ${act.id} Section ${sectionNumber}`
            );

        } else {

            const existing =
                existingRows[0];

            if (
                existing.content_hash ===
                contentHash
            ) {
                skipped++;
                continue;
            }

            await db.query(
                `
                UPDATE legal_knowledge
                SET
                    act_number = ?,
                    section_title = ?,
                    content = ?,
                    source_name = ?,
                    source_url = ?,
                    effective_date = ?,
                    source_version = ?,
                    content_hash = ?
                WHERE id = ?
                `,
                [
                    actNumber,
                    title,
                    content,
                    "eCourts India / India Code",
                    sourceUrl,
                    effectiveDate,
                    sourceVersion,
                    contentHash,
                    existing.id
                ]
            );

            updated++;

            console.log(
                `UPDATED ${act.id} Section ${sectionNumber}`
            );
        }

        await sleep(REQUEST_DELAY_MS);
    }

    return {
        inserted,
        updated,
        skipped
    };
}

async function main() {

    console.log(
        "\n========================================"
    );

    console.log(
        "NYAYA AI — CENTRAL ACTS INGESTION"
    );

    console.log(
        "========================================\n"
    );

    const acts =
        await getCentralActs();

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    let processedActs = 0;

    for (const act of acts) {

    if (!act.in_force) {
        continue;
    }

    /*
     * First expansion batch:
     * BNS + BSA
     *
     * BNSS is already present in the database.
     */
    const allowedActs = [
        "bns",
        "bsa"
    ];

    if (!allowedActs.includes(act.id)) {
        continue;
    }

        const result =
            await ingestAct(act);

        totalInserted +=
            result.inserted;

        totalUpdated +=
            result.updated;

        totalSkipped +=
            result.skipped;

        processedActs++;

        console.log(
            `\nProgress: ${processedActs} in-force Acts processed`
        );
    }

    console.log(
        "\n========================================"
    );

    console.log(
        "INGESTION COMPLETE"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Acts processed : ${processedActs}`
    );

    console.log(
        `Inserted       : ${totalInserted}`
    );

    console.log(
        `Updated        : ${totalUpdated}`
    );

    console.log(
        `Skipped        : ${totalSkipped}`
    );

    console.log(
        "========================================\n"
    );

    await db.end();
}

main().catch(error => {

    console.error(
        "\n❌ INGESTION FAILED"
    );

    console.error(
        error.stack || error.message
    );

    process.exitCode = 1;
});