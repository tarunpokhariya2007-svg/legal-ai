const db = require("../db");

async function ensureLegalKnowledgeTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS legal_knowledge (
                id INT NOT NULL AUTO_INCREMENT,

                act_name VARCHAR(255) NOT NULL,
                act_number VARCHAR(50) DEFAULT NULL,
                section_number VARCHAR(50) DEFAULT NULL,
                section_title VARCHAR(500) DEFAULT NULL,

                content LONGTEXT NOT NULL,

                source_name VARCHAR(255) NOT NULL DEFAULT 'India Code',
                source_url TEXT DEFAULT NULL,

                effective_date DATE DEFAULT NULL,
                source_version VARCHAR(100) DEFAULT NULL,

                content_hash CHAR(64) DEFAULT NULL,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

                PRIMARY KEY (id),

                INDEX idx_legal_act (act_name),
                INDEX idx_legal_section (act_name, section_number),
                INDEX idx_legal_title (section_title),

                UNIQUE KEY uq_legal_section (
                    act_name,
                    section_number
                )
            )
        `);

        console.log("LEGAL KNOWLEDGE TABLE READY");

    } catch (error) {

        console.error(
            "FAILED TO CREATE LEGAL KNOWLEDGE TABLE:",
            error.message
        );

    }
}

module.exports = {
    ensureLegalKnowledgeTable
};