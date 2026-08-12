const db = require("../db");

async function createUser(
    fullName,
    email,
    password,
    phone,
    role = "citizen"
) {

    const sql = `
        INSERT INTO users
        (full_name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(
        sql,
        [
            fullName,
            email,
            password,
            phone,
            role
        ]
    );

    return result;
}


async function findUserByEmail(email) {

    console.log("Searching email:", email);

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    const [rows] = await db.query(
        sql,
        [email]
    );

    console.log("Rows found:", rows);

    return rows[0];
}


module.exports = {
    createUser,
    findUserByEmail
};