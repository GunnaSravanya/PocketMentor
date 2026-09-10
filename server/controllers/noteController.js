import { NoteModel } from "../models/NoteModel.js";
import { SummaryModel } from "../models/SummaryModel.js";
import { FlashcardSetModel } from "../models/FlashcardSetModel.js";
import { QuizModel } from "../models/QuizModel.js";
import { QuizAttemptModel } from "../models/QuizAttemptModel.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { extractTextFromBuffer } from "../services/pdfService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * Create a new Note from either an uploaded PDF/document or pasted text
 */
export const createNote = async (req, res) => {
  try {
    const { title, text, sourceType } = req.body;
    let finalTitle = title ? title.trim() : "";
    let finalSourceType = sourceType || "text";
    let fileName = "";
    let fileUrl = "";
    let fileType = "";
    let extractedText = "";

    if (req.file) {
      // File upload flow
      finalSourceType = "file";
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      if (!finalTitle) {
        finalTitle = fileName.replace(/\.[^/.]+$/, "");
      }

      // 1. Extract text
      extractedText = await extractTextFromBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      // 2. Upload file to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        fileName
      );
      fileUrl = uploadResult.url;
    } else {
      // Pasted text flow (Do not upload to Cloudinary)
      finalSourceType = "text";
      extractedText = (text || "").trim();
      if (!finalTitle) {
        finalTitle = "Untitled Note " + new Date().toLocaleDateString();
      }

      if (!extractedText || extractedText.length < 10) {
        return sendError(
          res,
          400,
          "Please provide sufficient study notes (minimum 10 characters)."
        );
      }
    }

    const newNote = await NoteModel.create({
      userId: req.user._id,
      title: finalTitle,
      sourceType: finalSourceType,
      fileName,
      fileUrl,
      fileType,
      extractedText,
    });

    return sendSuccess(res, 201, "Note created successfully", {
      noteId: newNote._id,
      note: newNote,
    });
  } catch (error) {
    console.error("[Create Note Error]", error);
    return sendError(res, 500, error.message || "Failed to create note");
  }
};

/**
 * Get all notes belonging to the authenticated user
 */
export const getNotes = async (req, res) => {
  try {
    const notes = await NoteModel.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-extractedText"); // Exclude large text for list view

    // Enrich with hasSummary, hasFlashcards, quizCount, attempts, and progress percentage
    const enrichedNotes = await Promise.all(
      notes.map(async (note) => {
        const hasSummary = await SummaryModel.exists({ noteId: note._id });
        const hasFlashcards = await FlashcardSetModel.exists({ noteId: note._id });
        const quizzes = await QuizModel.find({ noteId: note._id });
        const quizIds = quizzes.map((q) => q._id);
        const attempts = await QuizAttemptModel.find({ quizId: { $in: quizIds }, userId: req.user._id });

        // Calculate progress percentage per note
        let progress = 0;
        if (hasSummary) progress += 25;
        if (hasFlashcards) progress += 25;
        if (quizzes.length > 0) progress += 25;
        if (attempts.length > 0) progress += 25;

        // Calculate best score percentage if any
        let bestScore = null;
        if (attempts.length > 0) {
          const maxPct = Math.max(...attempts.map((a) => Math.round((a.score / (a.totalQuestions || 1)) * 100)));
          bestScore = maxPct;
        }

        return {
          ...note.toObject(),
          hasSummary: Boolean(hasSummary),
          hasFlashcards: Boolean(hasFlashcards),
          quizCount: quizzes.length,
          attemptsCount: attempts.length,
          progress,
          bestScore,
        };
      })
    );

    return sendSuccess(res, 200, "Notes retrieved successfully", {
      notes: enrichedNotes,
    });
  } catch (error) {
    console.error("[Get Notes Error]", error);
    return sendError(res, 500, "Failed to retrieve notes");
  }
};

/**
 * Get single note details by noteId with ownership check
 */
export const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    // Ownership check
    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    // Check existing resources
    const summary = await SummaryModel.findOne({ noteId: note._id });
    const flashcardSet = await FlashcardSetModel.findOne({ noteId: note._id });
    const quizzes = await QuizModel.find({ noteId: note._id }).sort({ generationNumber: -1 });
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttemptModel.find({ quizId: { $in: quizIds }, userId: req.user._id }).sort({ createdAt: -1 });

    let progress = 0;
    if (summary) progress += 25;
    if (flashcardSet) progress += 25;
    if (quizzes.length > 0) progress += 25;
    if (attempts.length > 0) progress += 25;

    return sendSuccess(res, 200, "Note details retrieved", {
      note,
      summary,
      flashcardsCount: flashcardSet?.cards?.length || 0,
      hasFlashcards: Boolean(flashcardSet),
      progress,
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        generationNumber: q.generationNumber,
        questionCount: q.questions.length,
        createdAt: q.createdAt,
      })),
      attemptsCount: attempts.length,
      latestAttempt: attempts[0] || null,
    });
  } catch (error) {
    console.error("[Get Note By Id Error]", error);
    return sendError(res, 500, error.message || "Failed to retrieve note");
  }
};

/**
 * Delete note and all associated summaries, flashcards, quizzes, and attempts
 */
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await NoteModel.findById(noteId);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    // Ownership check
    if (note.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. You do not own this note.");
    }

    // Find all quizzes for this note to delete their attempts
    const quizzes = await QuizModel.find({ noteId: note._id });
    const quizIds = quizzes.map((q) => q._id);

    await Promise.all([
      NoteModel.findByIdAndDelete(noteId),
      SummaryModel.deleteMany({ noteId: note._id }),
      FlashcardSetModel.deleteMany({ noteId: note._id }),
      QuizModel.deleteMany({ noteId: note._id }),
      QuizAttemptModel.deleteMany({ quizId: { $in: quizIds } }),
    ]);

    return sendSuccess(res, 200, "Note and all associated revision data deleted successfully");
  } catch (error) {
    console.error("[Delete Note Error]", error);
    return sendError(res, 500, "Failed to delete note");
  }
};
