const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createConversation,
  getConversations,
  getConversation,
} = require("../database/conversationModel");

const {
  createMessage,
  getMessages,
} = require("../database/messageModel");

const router = express.Router();

// Get all chats for logged-in user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);

    res.json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
});

// Create a new chat
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const title = req.body.title || "New Chat";

    const conversationId = await createConversation(
      req.user.id,
      title
    );

    res.json({
      success: true,
      conversationId,
    });
  } catch (err) {
    console.error("CREATE CONVERSATION ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});

// Get messages from one conversation
router.get(
  "/conversations/:id/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const conversationId = Number(req.params.id);

      const conversation = await getConversation(
        conversationId,
        req.user.id
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const messages = await getMessages(conversationId);

      res.json({
        success: true,
        conversation,
        messages,
      });
    } catch (err) {
      console.error("GET MESSAGES ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Failed to load messages",
      });
    }
  }
);

// Save a message
router.post(
  "/conversations/:id/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const conversationId = Number(req.params.id);
      const { sender, message } = req.body;

      if (!sender || !message) {
        return res.status(400).json({
          success: false,
          message: "Sender and message are required",
        });
      }

      if (sender !== "user" && sender !== "ai") {
        return res.status(400).json({
          success: false,
          message: "Sender must be user or ai",
        });
      }

      const conversation = await getConversation(
        conversationId,
        req.user.id
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const messageId = await createMessage(
        conversationId,
        sender,
        message
      );

      res.json({
        success: true,
        messageId,
      });
    } catch (err) {
      console.error("SAVE MESSAGE ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Failed to save message",
      });
    }
  }
);

module.exports = router;
