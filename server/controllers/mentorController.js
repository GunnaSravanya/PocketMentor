import { NoteModel } from "../models/NoteModel.js";
import { SummaryModel } from "../models/SummaryModel.js";
import { FlashcardSetModel } from "../models/FlashcardSetModel.js";
import { QuizModel } from "../models/QuizModel.js";
import { QuizAttemptModel } from "../models/QuizAttemptModel.js";
import { ConversationModel } from "../models/ConversationModel.js";
import { WEAK_AREA_THRESHOLD } from "../config/constants.js";
import {
  generateSummaryFromNotes,
  generateFlashcardsFromNotes,
  generateQuizFromNotes,
  generateExplanationsForMistakes,
  generateWeakAreaRevision,
  executeGrokChat,
} from "../services/grokService.js";
import {
  buildChatContext,
  generateConversationTitle,
  maybeUpdateConversationSummary,
} from "../services/chatContextService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * Generate or retrieve 60-second summary for a note
 */
export const getOrGenerateSummary = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { regenerate } = req.query;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    let summary = await SummaryModel.findOne({ noteId: note._id });

    if (!summary || regenerate === "true") {
      const summaryContent = await generateSummaryFromNotes(note.extractedText);
      if (summary) {
        summary.content = summaryContent;
        await summary.save();
      } else {
        summary = await SummaryModel.create({
          noteId: note._id,
          content: summaryContent,
        });
      }
    }

    return sendSuccess(res, 200, "Summary ready", { summary });
  } catch (error) {
    console.error("[Summary Controller Error]", error);
    return sendError(res, 500, error.message || "Failed to process summary");
  }
};

/**
 * Generate or retrieve flashcards for a note
 */
export const getOrGenerateFlashcards = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { regenerate } = req.query;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    let flashcardSet = await FlashcardSetModel.findOne({ noteId: note._id });

    if (!flashcardSet || regenerate === "true") {
      const cards = await generateFlashcardsFromNotes(note.extractedText);
      if (flashcardSet) {
        flashcardSet.cards = cards;
        await flashcardSet.save();
      } else {
        flashcardSet = await FlashcardSetModel.create({
          noteId: note._id,
          cards,
        });
      }
    }

    return sendSuccess(res, 200, "Flashcards ready", { flashcardSet });
  } catch (error) {
    console.error("[Flashcards Controller Error]", error);
    return sendError(res, 500, error.message || "Failed to process flashcards");
  }
};

/**
 * Generate or retrieve generation 1 Quiz for a note
 */
export const getOrGenerateQuiz = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    // Check if an existing quiz exists for this note
    let quiz = await QuizModel.findOne({ noteId: note._id }).sort({ generationNumber: -1 });

    if (!quiz) {
      const questions = await generateQuizFromNotes(note.extractedText, 1);
      quiz = await QuizModel.create({
        noteId: note._id,
        generationNumber: 1,
        questions,
      });
    }

    // Sanitize questions so correct answers are not leaked to the client during attempt
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));

    return sendSuccess(res, 200, "Quiz ready", {
      quiz: {
        _id: quiz._id,
        noteId: quiz.noteId,
        generationNumber: quiz.generationNumber,
        questions: safeQuestions,
        createdAt: quiz.createdAt,
      },
    });
  } catch (error) {
    console.error("[Quiz Controller Error]", error);
    return sendError(res, 500, error.message || "Failed to process quiz");
  }
};

/**
 * Generate a completely new quiz (Generation N+1) from the same note
 */
export const generateNewQuiz = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    const latestQuiz = await QuizModel.findOne({ noteId: note._id }).sort({ generationNumber: -1 });
    const nextGen = (latestQuiz?.generationNumber || 0) + 1;

    const questions = await generateQuizFromNotes(note.extractedText, nextGen);
    const newQuiz = await QuizModel.create({
      noteId: note._id,
      generationNumber: nextGen,
      questions,
    });

    const safeQuestions = newQuiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));

    return sendSuccess(res, 201, `Quiz Generation #${nextGen} created`, {
      quiz: {
        _id: newQuiz._id,
        noteId: newQuiz.noteId,
        generationNumber: newQuiz.generationNumber,
        questions: safeQuestions,
        createdAt: newQuiz.createdAt,
      },
    });
  } catch (error) {
    console.error("[New Quiz Error]", error);
    return sendError(res, 500, error.message || "Failed to generate new quiz");
  }
};

/**
 * Get quiz details by quizId (without leaking answers)
 */
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await QuizModel.findById(quizId).populate("noteId");
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    if (quiz.noteId.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied");
    }

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));

    return sendSuccess(res, 200, "Quiz retrieved", {
      quiz: {
        _id: quiz._id,
        noteId: quiz.noteId._id,
        noteTitle: quiz.noteId.title,
        generationNumber: quiz.generationNumber,
        questions: safeQuestions,
        createdAt: quiz.createdAt,
      },
    });
  } catch (error) {
    console.error("[Get Quiz Error]", error);
    return sendError(res, 500, "Failed to retrieve quiz");
  }
};

/**
 * Submit quiz, compute score, evaluate weak areas, and generate AI explanations
 */
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }

    if (!Array.isArray(answers)) {
      return sendError(res, 400, "Answers must be provided as an array");
    }

    const quiz = await QuizModel.findById(quizId).populate("noteId");
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    if (quiz.noteId.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied");
    }

    // Map user answers by questionId string
    const userAnswersMap = {};
    answers.forEach((ans) => {
      if (ans.questionId) {
        userAnswersMap[ans.questionId.toString()] = ans.selectedAnswer || "";
      }
    });

    const detailedAnswers = [];
    const incorrectForAi = [];
    const topicStats = {};

    let correctCount = 0;

    quiz.questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const selected = (userAnswersMap[qIdStr] || "Unanswered").trim();
      const isCorrect = selected.toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        correctCount += 1;
      }

      // Track topic performance
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }
      topicStats[q.topic].total += 1;
      if (isCorrect) {
        topicStats[q.topic].correct += 1;
      }

      const answerRecord = {
        questionId: q._id,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        topic: q.topic,
        explanation: "", // Will be filled below
      };

      detailedAnswers.push(answerRecord);

      if (!isCorrect) {
        incorrectForAi.push({
          questionIndex: detailedAnswers.length - 1,
          question: q.question,
          selectedAnswer: selected,
          correctAnswer: q.correctAnswer,
          topic: q.topic,
        });
      }
    });

    // Generate explanations for incorrect answers
    let explanationMap = {};
    if (incorrectForAi.length > 0) {
      explanationMap = await generateExplanationsForMistakes(
        incorrectForAi,
        quiz.noteId.extractedText
      );
    }

    // Attach explanations
    incorrectForAi.forEach((item, idx) => {
      detailedAnswers[item.questionIndex].explanation =
        explanationMap[idx] ||
        `The correct answer is "${item.correctAnswer}". Review ${item.topic} in your study notes.`;
    });

    // Provide default positive explanation for correct answers
    detailedAnswers.forEach((ans) => {
      if (ans.isCorrect && !ans.explanation) {
        ans.explanation = `Correct! You answered "${ans.correctAnswer}" accurately for ${ans.topic}.`;
      }
    });

    // Optional Negative Marking configuration snapshot
    const markingConfig = {
      enabled: Boolean(req.body.marking?.enabled),
      correctMarks: Number(req.body.marking?.correctMarks ?? 1),
      negativeMarks: Number(req.body.marking?.negativeMarks ?? (req.body.marking?.enabled ? 0.25 : 0)),
    };

    // Calculate score with negative marking support
    let finalScore = 0;
    quiz.questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const selected = (userAnswersMap[qIdStr] || "").trim();
      const isAnswered = selected.length > 0 && selected.toLowerCase() !== "unanswered";
      const isCorrect = selected.toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        finalScore += markingConfig.correctMarks;
      } else if (isAnswered && markingConfig.enabled) {
        finalScore -= markingConfig.negativeMarks;
      }
    });

    // Clamp score to >= 0 and round to 2 decimal places if negative marking is enabled
    finalScore = markingConfig.enabled
      ? Math.max(0, Math.round(finalScore * 100) / 100)
      : correctCount;

    // Compute weak and strong areas + granular topic mastery matrix
    const weakAreas = [];
    const strongAreas = [];
    const topicMastery = [];

    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = Math.round((stats.correct / stats.total) * 100);
      const isMastered = accuracy >= WEAK_AREA_THRESHOLD;

      const areaData = {
        topic,
        correct: stats.correct,
        total: stats.total,
        accuracy,
        mastered: isMastered,
      };

      topicMastery.push(areaData);

      if (accuracy < WEAK_AREA_THRESHOLD) {
        weakAreas.push({
          topic,
          correct: stats.correct,
          total: stats.total,
          accuracy,
          mastered: false,
        });
      } else {
        strongAreas.push(areaData);
      }
    });

    // Save QuizAttempt with marking snapshot and topicMastery
    const attempt = await QuizAttemptModel.create({
      quizId: quiz._id,
      userId: req.user._id,
      answers: detailedAnswers,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      weakAreas,
      marking: markingConfig,
      topicMastery,
    });

    return sendSuccess(res, 201, "Quiz submitted successfully", {
      attemptId: attempt._id,
      quizId: quiz._id,
      score: finalScore,
      rawCorrect: correctCount,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
      weakAreas,
      strongAreas,
      topicMastery,
      marking: markingConfig,
      answers: detailedAnswers,
    });
  } catch (error) {
    console.error("[Quiz Submission Error]", error);
    return sendError(res, 500, error.message || "Failed to submit quiz");
  }
};

/**
 * Get all attempts for a specific quiz
 */
export const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await QuizAttemptModel.find({
      quizId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Quiz attempts retrieved", { attempts });
  } catch (error) {
    console.error("[Get Quiz Attempts Error]", error);
    return sendError(res, 500, "Failed to retrieve quiz attempts");
  }
};

/**
 * Get single quiz attempt by attemptId
 */
export const getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttemptModel.findById(attemptId).populate({
      path: "quizId",
      populate: { path: "noteId" },
    });

    if (!attempt) {
      return sendError(res, 404, "Quiz attempt not found");
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied");
    }

    // Build question text lookup
    const questionTextMap = {};
    if (attempt.quizId?.questions) {
      attempt.quizId.questions.forEach((q) => {
        questionTextMap[q._id.toString()] = q.question;
      });
    }

    const formattedAnswers = attempt.answers.map((ans) => ({
      ...ans.toObject(),
      questionText: questionTextMap[ans.questionId.toString()] || "Question",
    }));

    return sendSuccess(res, 200, "Quiz attempt details", {
      attempt: {
        _id: attempt._id,
        quizId: attempt.quizId._id,
        noteId: attempt.quizId.noteId?._id,
        noteTitle: attempt.quizId.noteId?.title || "Study Note",
        generationNumber: attempt.quizId.generationNumber || 1,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
        weakAreas: attempt.weakAreas,
        answers: formattedAnswers,
        createdAt: attempt.createdAt,
      },
    });
  } catch (error) {
    console.error("[Get Attempt By Id Error]", error);
    return sendError(res, 500, "Failed to retrieve attempt details");
  }
};

/**
 * Targeted revision for a weak area topic based on the original note
 */
export const reviseWeakTopic = async (req, res) => {
  try {
    const { attemptId, topic } = req.params;

    const attempt = await QuizAttemptModel.findById(attemptId).populate({
      path: "quizId",
      populate: { path: "noteId" },
    });

    if (!attempt) {
      return sendError(res, 404, "Attempt not found");
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied");
    }

    const note = attempt.quizId.noteId;
    if (!note) {
      return sendError(res, 404, "Original note not found");
    }

    const decodedTopic = decodeURIComponent(topic);
    const revisionData = await generateWeakAreaRevision(decodedTopic, note.extractedText);

    return sendSuccess(res, 200, `Revision for ${decodedTopic}`, {
      revision: revisionData,
      noteTitle: note.title,
    });
  } catch (error) {
    console.error("[Revise Weak Topic Error]", error);
    return sendError(res, 500, error.message || "Failed to generate weak area revision");
  }
};

/**
 * Dashboard stats: Notes count, Quizzes count, Average Score, Aggregated Weak Areas
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const notesCount = await NoteModel.countDocuments({ userId });
    const attempts = await QuizAttemptModel.find({ userId }).sort({ createdAt: -1 });

    const totalQuizzesTaken = attempts.length;

    let averageScore = 0;
    if (totalQuizzesTaken > 0) {
      const sumPercentages = attempts.reduce(
        (acc, att) => acc + (att.score / (att.totalQuestions || 1)) * 100,
        0
      );
      averageScore = Math.round(sumPercentages / totalQuizzesTaken);
    }

    // Aggregate weak areas frequency across recent attempts
    const weakAreaFreq = {};
    attempts.forEach((att) => {
      att.weakAreas.forEach((w) => {
        if (!weakAreaFreq[w.topic]) {
          weakAreaFreq[w.topic] = {
            topic: w.topic,
            occurrences: 0,
            latestAccuracy: w.accuracy,
          };
        }
        weakAreaFreq[w.topic].occurrences += 1;
      });
    });

    const aggregatedWeakAreas = Object.values(weakAreaFreq).sort(
      (a, b) => b.occurrences - a.occurrences
    );

    return sendSuccess(res, 200, "Dashboard statistics", {
      stats: {
        notesCount,
        totalQuizzesTaken,
        averageScore,
        weakAreasCount: aggregatedWeakAreas.length,
        weakAreas: aggregatedWeakAreas,
      },
      recentAttempts: attempts.slice(0, 5).map((att) => ({
        _id: att._id,
        quizId: att.quizId,
        score: att.score,
        totalQuestions: att.totalQuestions,
        percentage: Math.round((att.score / att.totalQuestions) * 100),
        weakAreasCount: att.weakAreas.length,
        createdAt: att.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Dashboard Stats Error]", error);
    return sendError(res, 500, "Failed to retrieve dashboard stats");
  }
};

/**
 * Overall quiz history across all notes
 */
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await QuizAttemptModel.find({ userId })
      .populate({
        path: "quizId",
        populate: { path: "noteId", select: "title sourceType createdAt" },
      })
      .sort({ createdAt: -1 });

    const history = attempts.map((att) => ({
      _id: att._id,
      quizId: att.quizId?._id,
      generationNumber: att.quizId?.generationNumber || 1,
      noteId: att.quizId?.noteId?._id,
      noteTitle: att.quizId?.noteId?.title || "Deleted Note",
      score: att.score,
      totalQuestions: att.totalQuestions,
      percentage: Math.round((att.score / (att.totalQuestions || 1)) * 100),
      weakAreas: att.weakAreas,
      createdAt: att.createdAt,
    }));

    return sendSuccess(res, 200, "Quiz history retrieved", { history });
  } catch (error) {
    console.error("[Quiz History Error]", error);
    return sendError(res, 500, "Failed to retrieve history");
  }
};

/**
 * Chatbot with Grok AI for answering student questions & doubts (Persistent & Context-Aware)
 */
export const chatWithMentorController = async (req, res) => {
  try {
    const { message, conversationId, noteId } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== "string" || !message.trim()) {
      return sendError(res, 400, "Message cannot be empty");
    }

    let note = null;
    if (noteId) {
      note = await NoteModel.findOne({ _id: noteId, userId });
      if (!note) {
        return sendError(res, 404, "Selected note not found or access denied");
      }
    }

    let conversation = null;
    if (conversationId) {
      conversation = await ConversationModel.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return sendError(res, 404, "Conversation not found or access denied");
      }
      // If note was specified and not set yet, update conversation noteId
      if (noteId && !conversation.noteId) {
        conversation.noteId = note._id;
      }
    } else {
      // Create new conversation with auto-generated title
      const initialTitle = generateConversationTitle(message);
      conversation = new ConversationModel({
        userId,
        noteId: note?._id || undefined,
        title: initialTitle,
        messages: [],
      });
    }

    // If conversation already has noteId and no note was loaded yet, load it
    if (!note && conversation.noteId) {
      note = await NoteModel.findOne({ _id: conversation.noteId, userId });
    }

    // Build context with System Instructions + Conversation Summary + Note Context + Bounded History + Message
    const chatContext = buildChatContext({
      conversation,
      note,
      currentMessage: message.trim(),
    });

    // Call Grok / Groq AI
    let aiReply;
    try {
      aiReply = await executeGrokChat(chatContext.messages);
    } catch (grokError) {
      console.error("[Grok Chat Execution Error]", grokError);
      return sendError(res, 500, grokError.message || "I'm having trouble connecting to the AI right now. Please try again in a moment.");
    }

    const userMsg = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    const assistantMsg = {
      role: "assistant",
      content: aiReply,
      timestamp: new Date(),
    };

    conversation.messages.push(userMsg);
    conversation.messages.push(assistantMsg);

    // Update title if needed
    if (conversation.title === "New Chat" || conversation.messages.length === 2) {
      conversation.title = generateConversationTitle(message);
    }

    // Condense older messages into conversationSummary if length exceeds threshold
    maybeUpdateConversationSummary(conversation);

    await conversation.save();

    return sendSuccess(res, 200, "Mentor reply received", {
      conversationId: conversation._id,
      title: conversation.title,
      noteId: conversation.noteId || null,
      message: assistantMsg,
      reply: aiReply,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("[Chat Controller Error]", error);
    return sendError(res, 500, error.message || "Failed to process chat message");
  }
};

/**
 * Get all conversations for the authenticated user
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await ConversationModel.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title noteId updatedAt createdAt messages conversationSummary")
      .populate("noteId", "title");

    const formatted = conversations.map((c) => ({
      _id: c._id,
      title: c.title,
      noteId: c.noteId?._id || c.noteId || null,
      noteTitle: c.noteId?.title || null,
      messageCount: c.messages?.length || 0,
      lastMessage: c.messages?.length > 0 ? c.messages[c.messages.length - 1].content.slice(0, 120) : "",
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return sendSuccess(res, 200, "Conversations retrieved", { conversations: formatted });
  } catch (error) {
    console.error("[Get Conversations Error]", error);
    return sendError(res, 500, "Failed to retrieve conversations");
  }
};

/**
 * Get a single conversation with full message history
 */
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await ConversationModel.findOne({ _id: conversationId, userId })
      .populate("noteId", "title");

    if (!conversation) {
      return sendError(res, 404, "Conversation not found or access denied");
    }

    return sendSuccess(res, 200, "Conversation retrieved", {
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        noteId: conversation.noteId?._id || conversation.noteId || null,
        noteTitle: conversation.noteId?.title || null,
        conversationSummary: conversation.conversationSummary || "",
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Get Conversation By Id Error]", error);
    return sendError(res, 500, "Failed to retrieve conversation");
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const deleted = await ConversationModel.findOneAndDelete({ _id: conversationId, userId });
    if (!deleted) {
      return sendError(res, 404, "Conversation not found or access denied");
    }

    return sendSuccess(res, 200, "Conversation deleted successfully");
  } catch (error) {
    console.error("[Delete Conversation Error]", error);
    return sendError(res, 500, "Failed to delete conversation");
  }
};

/**
 * Rename a conversation (optional PATCH)
 */
export const renameConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    const userId = req.user._id;

    if (!title || typeof title !== "string" || !title.trim()) {
      return sendError(res, 400, "Title cannot be empty");
    }

    const conversation = await ConversationModel.findOneAndUpdate(
      { _id: conversationId, userId },
      { title: title.trim() },
      { new: true }
    );

    if (!conversation) {
      return sendError(res, 404, "Conversation not found or access denied");
    }

    return sendSuccess(res, 200, "Conversation renamed", {
      conversation: {
        _id: conversation._id,
        title: conversation.title,
      },
    });
  } catch (error) {
    console.error("[Rename Conversation Error]", error);
    return sendError(res, 500, "Failed to rename conversation");
  }
};

/**
 * Expose AI provider status safely without leaking keys
 */
export const getAiProviderStatus = async (req, res) => {
  try {
    const hasKey = Boolean(process.env.GROK_API_KEY && process.env.GROK_API_KEY.trim().length > 0 && process.env.GROK_API_KEY !== "your_grok_api_key_here");
    const isGroq = process.env.GROK_API_KEY?.startsWith("gsk_");
    const providerName = process.env.AI_PRIMARY_PROVIDER || (isGroq ? "groq" : "grok");

    return sendSuccess(res, 200, "AI Engine Status", {
      provider: providerName,
      status: hasKey ? "operational" : "demo_fallback",
      isFallbackAvailable: true,
      model: process.env.GROK_MODEL || (isGroq ? "qwen/qwen3.8-27b" : "grok-2-latest"),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve AI provider status");
  }
};

