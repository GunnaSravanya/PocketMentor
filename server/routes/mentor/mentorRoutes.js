import { Router } from "express";
import {
  getOrGenerateSummary,
  getOrGenerateFlashcards,
  getOrGenerateQuiz,
  generateNewQuiz,
  getQuizById,
  submitQuiz,
  getQuizAttempts,
  getAttemptById,
  reviseWeakTopic,
  getDashboardStats,
  getQuizHistory,
  chatWithMentorController,
  getConversations,
  getConversationById,
  deleteConversation,
  renameConversation,
  getAiProviderStatus,
} from "../../controllers/mentorController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// AI Provider Status
router.get("/ai-status", getAiProviderStatus);

// Summary
router.post("/summary/:noteId", getOrGenerateSummary);
router.get("/summary/:noteId", getOrGenerateSummary);

// Flashcards
router.post("/flashcards/:noteId", getOrGenerateFlashcards);
router.get("/flashcards/:noteId", getOrGenerateFlashcards);

// Quiz Generation & Attempt
router.post("/quiz/:noteId", getOrGenerateQuiz);
router.post("/quiz/:noteId/new", generateNewQuiz);
router.get("/quiz/:quizId", getQuizById);
router.post("/quiz/:quizId/submit", submitQuiz);
router.get("/quiz/:quizId/attempts", getQuizAttempts);

// Attempt Details & History
router.get("/attempt/:attemptId", getAttemptById);
router.get("/history", getQuizHistory);
router.get("/stats", getDashboardStats);

// Weak Area Revision
router.all("/revise/:attemptId/:topic", reviseWeakTopic);

// Grok AI Chatbot & Persistent Conversations
router.post("/chat", chatWithMentorController);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", getConversationById);
router.delete("/conversations/:conversationId", deleteConversation);
router.patch("/conversations/:conversationId", renameConversation);

export default router;
