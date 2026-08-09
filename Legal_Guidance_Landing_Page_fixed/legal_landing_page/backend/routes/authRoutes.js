const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail
} = require("../database/userModel");

const router = express.Router();

const JWT_SECRET = "nyaya_secret_key";

router.post("/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            phone
        } = req.body;

        const existingUser = await findUserByEmail(email);

        if (existingUser) {

            return res.json({
                success: false,
                message: "Email already registered."
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser(
            fullName,
            email,
            hashedPassword,
            phone
        );

        res.json({
            success: true,
            message: "Signup Successful"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("Received email:", email);
        console.log("Received password:", password);

        const user = await findUserByEmail(email);

        console.log("User found:", user);

        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });

        }

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        console.log("Password valid:", valid);

        if (!valid) {

            return res.json({
                success: false,
                message: "Invalid password"
            });

        }

        const token = jwt.sign(
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
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;