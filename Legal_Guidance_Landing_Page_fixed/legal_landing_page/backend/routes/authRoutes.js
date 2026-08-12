const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail
} = require("../database/userModel");

const router = express.Router();

const JWT_SECRET = "nyaya_secret_key";


// ==========================================
// SIGNUP
// ==========================================

router.post("/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            phone,
            role
        } = req.body;

        const existingUser =
            await findUserByEmail(email);

        if (existingUser) {

            return res.json({
                success: false,
                message:
                    "Email already registered."
            });

        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // UI says Advocate,
        // database stores lawyer
        const userRole =
            role === "lawyer"
                ? "lawyer"
                : "citizen";

        const result =
            await createUser(
                fullName,
                email,
                hashedPassword,
                phone,
                userRole
            );

        res.json({
            success: true,
            message:
                "Signup Successful",

            user: {
                id: result.insertId,
                fullName,
                email,
                phone,
                role: userRole
            }
        });

    } catch (err) {

        console.error(
            "SIGNUP ERROR:",
            err
        );

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        console.log(
            "Received email:",
            email
        );

        const user =
            await findUserByEmail(email);

        console.log(
            "User found:",
            user
        );

        if (!user) {

            return res.json({
                success: false,
                message:
                    "User not found"
            });

        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.json({
                success: false,
                message:
                    "Invalid password"
            });

        }

        const token =
            jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.json({

            success: true,

            token,

            user: {
                id: user.id,
                fullName:
                    user.full_name,
                email:
                    user.email,
                phone:
                    user.phone,
                role:
                    user.role
            }

        });

    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;