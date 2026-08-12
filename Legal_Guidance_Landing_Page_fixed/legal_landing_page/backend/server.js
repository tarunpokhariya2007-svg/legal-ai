require("dotenv").config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const express = require("express");
const cors = require("cors");


require("./db");


const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const masterAgent = require("./agents/masterAgent");

const app = express();

app.use(cors({
  origin: true, // reflects whatever origin the request came from (dev-friendly)
  credentials: true
}));

app.use(express.json());



app.use("/uploads", express.static("uploads"));

app.use("/api", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/chat", chatRoutes);


app.get("/test", (req, res) => {
    res.json({
        message: "Backend is working!"
    });
});

app.post("/analyze", authMiddleware, async (req, res) => {

    try {

        const result = await masterAgent({
            ...req.body,
            userId: req.user.id
        });

        res.json(result);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            response: "Backend Error"
        });

    }

});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});