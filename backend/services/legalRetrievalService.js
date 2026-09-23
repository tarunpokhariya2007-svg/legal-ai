const db = require("../db");

/**
 * Retrieve relevant legal provisions from the local
 * legal knowledge base.
 *
 * This is the retrieval layer of Nyaya AI's RAG pipeline.
 */
async function retrieveRelevantLaws(query, limit = 8) {

    if (!query || !query.trim()) {
        return [];
    }

    const searchQuery = query.trim();

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

                MATCH(section_title, content)
                AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance

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