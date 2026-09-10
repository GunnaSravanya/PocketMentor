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
} from "../../controllers/mentorController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

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

// Grok AI Chatbot
router.post("/chat", chatWithMentorController);

export default router;
