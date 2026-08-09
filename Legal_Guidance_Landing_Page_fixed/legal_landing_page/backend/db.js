const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Tarun@2007",
    database: "nyaya_ai",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;