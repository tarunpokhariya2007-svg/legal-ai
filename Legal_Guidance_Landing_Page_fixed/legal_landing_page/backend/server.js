require("dotenv").config();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const express = require("express");
const cors = require("cors");

require("./db");

// =====================================================
// ROUTES
// =====================================================

const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const caseRoutes = require("./routes/caseRoutes");

// =====================================================
// MIDDLEWARE / AGENTS
// =====================================================

const authMiddleware = require("./middleware/authMiddleware");
const masterAgent = require("./agents/masterAgent");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static("uploads")
);

// =====================================================
// API ROUTES
// =====================================================

// Upload routes
app.use(
  "/api",
  uploadRoutes
);

// Authentication routes
app.use(
  "/api/auth",
  authRoutes
);

// Voice routes
app.use(
  "/api/voice",
  voiceRoutes
);

// Lawyer / Advocate routes
app.use(
  "/api/lawyers",
  lawyerRoutes
);

// Chat / Conversation routes
app.use(
  "/api/chat",
  chatRoutes
);

// Case routes
app.use(
  "/api/cases",
  caseRoutes
);

// =====================================================
// BACKEND TEST
// =====================================================

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
  });
});

// =====================================================
// AI CASE ANALYSIS
// =====================================================

app.post(
  "/analyze",
  authMiddleware,
  async (req, res) => {
    try {
      console.log(
        "================================="
      );

      console.log(
        "ANALYZE REQUEST RECEIVED"
      );

      console.log(
        "USER ID:",
        req.user.id
      );

      console.log(
        "================================="
      );

      const result =
        await masterAgent({
          ...req.body,
          userId: req.user.id,
        });

      res.json(result);

    } catch (err) {
      console.error(
        "ANALYZE ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        response: "Backend Error",
        message:
          err.message ||
          "Failed to analyze case",
      });
    }
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

const PORT = 5001;

app.listen(
  PORT,
  () => {
    console.log(
      "================================="
    );

    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      `Test API: http://localhost:${PORT}/test`
    );

    console.log(
      `Cases API: http://localhost:${PORT}/api/cases`
    );

    console.log(
      `Lawyers API: http://localhost:${PORT}/api/lawyers`
    );

    console.log(
      `Chat API: http://localhost:${PORT}/api/chat`
    );

    console.log(
      "================================="
    );
  }
);