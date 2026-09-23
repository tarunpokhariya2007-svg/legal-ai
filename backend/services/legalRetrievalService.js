const db = require("../db");

/**
 * Extract an explicit section number from a user query.
 *
 * Examples:
 * "Section 478 of BNSS"
 * "BNSS section 478"
 * "section 478 Bharatiya Nagarik Suraksha Sanhita"
 */
function extractSectionNumber(query) {
    const match = query.match(
        /\bsection\s+(\d+[A-Za-z]?(?:\([A-Za-z0-9]+\))?)\b/i
    );

    return match ? match[1] : null;
}

/**
 * Detect whether the query refers to BNSS.
 */
function isBNSSQuery(query) {
    const normalized = query.toLowerCase();

    return (
        normalized.includes("bnss") ||
        normalized.includes(
            "bharatiya nagarik suraksha sanhita"
        )
    );
}

/**
 * Retrieve an exact legal section.
 */
async function retrieveExactSection(
    sectionNumber,
    actName
) {
    try {

        const [rows] = await db.query(
            `
            SELECT
                id,
                act_name,
                act_number,
                section_number,
                section_title,
                content,
                source_name,
                source_url,
                effective_date,
                source_version,

                1.0 AS relevance

            FROM legal_knowledge

            WHERE section_number = ?
              AND act_name = ?

            LIMIT 1
            `,
            [
                sectionNumber,
                actName
            ]
        );

        return rows;

    } catch (error) {

        console.error(
            "EXACT LEGAL RETRIEVAL ERROR:",
            error.message
        );

        return [];
    }
}


/**
 * Retrieve relevant legal provisions from the local
 * legal knowledge base.
 *
 * Retrieval strategy:
 *
 * 1. Exact section retrieval when the user explicitly
 *    mentions a section and BNSS.
 *
 * 2. Otherwise use MySQL FULLTEXT search.
 */
async function retrieveRelevantLaws(
    query,
    limit = 4
) {

    if (!query || !query.trim()) {
        return [];
    }

    const searchQuery =
        query.trim();

    try {

        /*
         * --------------------------------------------------
         * STEP 1 — EXACT SECTION RETRIEVAL
         * --------------------------------------------------
         */

        const sectionNumber =
            extractSectionNumber(
                searchQuery
            );

        if (
            sectionNumber &&
            isBNSSQuery(searchQuery)
        ) {

            console.log(
                `LEGAL RAG: Exact BNSS section detected: ${sectionNumber}`
            );

            const exactResults =
                await retrieveExactSection(
                    sectionNumber,
                    "The Bharatiya Nagarik Suraksha Sanhita, 2023"
                );

            if (exactResults.length > 0) {

                console.log(
                    `LEGAL RAG: Exact section ${sectionNumber} retrieved`
                );

                return exactResults;
            }

            /*
             * If the exact section wasn't found,
             * continue to normal FULLTEXT retrieval.
             */

            console.log(
                `LEGAL RAG: Exact section ${sectionNumber} not found, using FULLTEXT`
            );
        }


        /*
         * --------------------------------------------------
         * STEP 2 — FULLTEXT RETRIEVAL
         * --------------------------------------------------
         */

        const [rows] =
            await db.query(
                `
                SELECT
                    id,
                    act_name,
                    act_number,
                    section_number,
                    section_title,
                    content,
                    source_name,
                    source_url,
                    effective_date,
                    source_version,

                    MATCH(section_title, content)
                    AGAINST (? IN NATURAL LANGUAGE MODE)
                    AS relevance

                FROM legal_knowledge

                WHERE MATCH(section_title, content)
                    AGAINST (? IN NATURAL LANGUAGE MODE)

                ORDER BY relevance DESC

                LIMIT ?
                `,
                [
                    searchQuery,
                    searchQuery,
                    limit
                ]
            );

        console.log(
            `LEGAL RAG: FULLTEXT retrieved ${rows.length} provision(s)`
        );

        return rows;

    } catch (error) {

        console.error(
            "LEGAL RETRIEVAL ERROR:",
            error.message
        );

        return [];
    }
}


module.exports = {
    retrieveRelevantLaws
};