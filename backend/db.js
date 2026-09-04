const mysql = require("mysql2/promise");

console.log("DATABASE CONNECTION:");

console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("DATABASE:", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10
});

// =====================================================
// CREATE NOTIFICATIONS TABLE
// =====================================================

async function initializeNotificationsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                related_id INT DEFAULT NULL,
                is_read TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                PRIMARY KEY (id),

                INDEX idx_notifications_user (user_id),
                INDEX idx_notifications_read (user_id, is_read),
                INDEX idx_notifications_created (user_id, created_at),

                CONSTRAINT fk_notifications_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);

        console.log("NOTIFICATIONS TABLE READY");
    } catch (error) {
        console.error(
            "FAILED TO CREATE NOTIFICATIONS TABLE:",
            error.message
        );
    }
}

initializeNotificationsTable();

module.exports = pool;