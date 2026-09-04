const express = require("express");
const db = require("../db");

const authMiddleware = require("../middleware/authMiddleware");
const { createNotification } = require("./notificationRoutes");

const router = express.Router();

// =====================================================
// CREATE APPOINTMENT
// =====================================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const citizenId = req.user.id;

        const {
            advocateId,
            appointmentDate,
            appointmentTime,
            mode,
            consultationFee,
            platformFee,
            totalFee
        } = req.body;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !advocateId ||
            !appointmentDate ||
            !appointmentTime
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Advocate, appointment date and appointment time are required."
            });
        }

        // -------------------------------------------------
        // VERIFY ADVOCATE
        // -------------------------------------------------

        const [lawyers] = await db.query(
            `
                SELECT
                    id,
                    full_name,
                    email,
                    role
                FROM users
                WHERE id = ?
                  AND role = 'lawyer'
                LIMIT 1
            `,
            [advocateId]
        );

        if (lawyers.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Selected advocate was not found."
            });

        }

        const advocate = lawyers[0];

        // -------------------------------------------------
        // PREVENT DOUBLE BOOKING
        // -------------------------------------------------

        const [existingAppointments] = await db.query(
            `
                SELECT id
                FROM appointments
                WHERE advocate_id = ?
                  AND appointment_date = ?
                  AND appointment_time = ?
                  AND status IN ('pending', 'confirmed')
                LIMIT 1
            `,
            [
                advocateId,
                appointmentDate,
                appointmentTime
            ]
        );

        if (existingAppointments.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "This appointment slot is already booked."
            });

        }

        // -------------------------------------------------
        // CREATE APPOINTMENT
        // -------------------------------------------------

        const [result] = await db.query(
            `
                INSERT INTO appointments
                (
                    citizen_id,
                    advocate_id,
                    appointment_date,
                    appointment_time,
                    mode,
                    consultation_fee,
                    platform_fee,
                    total_fee,
                    status,
                    payment_status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                citizenId,
                advocateId,
                appointmentDate,
                appointmentTime,
                mode || "video",
                Number(consultationFee) || 0,
                Number(platformFee) || 0,
                Number(totalFee) || 0,
                "confirmed",
                "success"
            ]
        );

        const appointmentId = result.insertId;

        // -------------------------------------------------
        // GET CITIZEN NAME
        // -------------------------------------------------

        const [citizens] = await db.query(
            `
                SELECT
                    id,
                    full_name
                FROM users
                WHERE id = ?
                LIMIT 1
            `,
            [citizenId]
        );

        const citizenName =
            citizens[0]?.full_name ||
            "A citizen";

        // -------------------------------------------------
        // CITIZEN NOTIFICATION
        // -------------------------------------------------

        await createNotification({
            userId: citizenId,

            type: "appointment_booked",

            title: "Appointment booked successfully",

            message:
                `Your consultation with Adv. ${advocate.full_name} ` +
                `has been confirmed for ${appointmentDate} at ${appointmentTime}.`,

            relatedId: appointmentId
        });

        // -------------------------------------------------
        // ADVOCATE NOTIFICATION
        // -------------------------------------------------

        await createNotification({
            userId: advocateId,

            type: "new_consultation_request",

            title: "New consultation request",

            message:
                `${citizenName} booked a consultation with you ` +
                `for ${appointmentDate} at ${appointmentTime}.`,

            relatedId: appointmentId
        });

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Appointment booked successfully.",

            appointment: {
                id: appointmentId,
                citizenId,
                advocateId,
                advocateName: advocate.full_name,
                appointmentDate,
                appointmentTime,
                mode: mode || "video",
                consultationFee:
                    Number(consultationFee) || 0,
                platformFee:
                    Number(platformFee) || 0,
                totalFee:
                    Number(totalFee) || 0,
                status: "confirmed",
                paymentStatus: "success"
            }

        });

    } catch (error) {

        console.error(
            "CREATE APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create appointment."

        });

    }

});


// =====================================================
// GET MY APPOINTMENTS
// =====================================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        const [rows] = await db.query(
            `
                SELECT
                    a.*,

                    citizen.full_name AS citizen_name,
                    citizen.email AS citizen_email,

                    advocate.full_name AS advocate_name,
                    advocate.email AS advocate_email

                FROM appointments a

                INNER JOIN users citizen
                    ON citizen.id = a.citizen_id

                INNER JOIN users advocate
                    ON advocate.id = a.advocate_id

                WHERE
                    a.citizen_id = ?
                    OR a.advocate_id = ?

                ORDER BY
                    a.appointment_date DESC,
                    a.created_at DESC
            `,
            [
                userId,
                userId
            ]
        );

        return res.json({

            success: true,

            appointments: rows

        });

    } catch (error) {

        console.error(
            "GET APPOINTMENTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load appointments."

        });

    }

});


module.exports = router;