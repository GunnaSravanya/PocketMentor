import { UserModel } from "../models/UserModel.js";
import { NoteModel } from "../models/NoteModel.js";
import { QuizModel } from "../models/QuizModel.js";
import { QuizAttemptModel } from "../models/QuizAttemptModel.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * Get comprehensive admin statistics
 */
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalNotes, totalQuizzes, totalAttempts] = await Promise.all([
      UserModel.countDocuments(),
      NoteModel.countDocuments(),
      QuizModel.countDocuments(),
      QuizAttemptModel.countDocuments(),
    ]);

    const recentUsers = await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentNotes = await NoteModel.find()
      .populate("userId", "Fname Lname email")
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, "Admin stats retrieved", {
      stats: {
        totalUsers,
        totalNotes,
        totalQuizzes,
        totalAttempts,
      },
      recentUsers,
      recentNotes,
    });
  } catch (error) {
    console.error("[Admin Stats Error]", error);
    return sendError(res, 500, "Failed to retrieve admin statistics");
  }
};

/**
 * Get system health and AI configuration status (sanitized)
 */
export const getAdminSystemStatus = async (req, res) => {
  try {
    const hasGrokKey = Boolean(process.env.GROK_API_KEY && process.env.GROK_API_KEY !== "your_grok_api_key_here");
    const isGroq = process.env.GROK_API_KEY?.startsWith("gsk_");
    const hasMongo = Boolean(process.env.MONGO_URI);
    const hasCloudinary = Boolean(process.env.CLOUDINARY_API_KEY);

    return sendSuccess(res, 200, "System status retrieved", {
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
      services: {
        database: { connected: hasMongo, provider: "MongoDB Atlas" },
        aiEngine: {
          configured: hasGrokKey,
          provider: process.env.AI_PRIMARY_PROVIDER || (isGroq ? "groq" : "grok"),
          model: process.env.GROK_MODEL || (isGroq ? "qwen/qwen3.8-27b" : "grok-2-latest"),
        },
        storage: { configured: hasCloudinary, provider: "Cloudinary" },
      },
    });
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve system status");
  }
};

/**
 * List all users with pagination for admin
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 200, "Users retrieved", { users });
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve users");
  }
};
