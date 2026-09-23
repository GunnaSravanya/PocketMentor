import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const QuizAttemptSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "quiz",
      required: [true, "quizId is required"],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "userId is required"],
    },

    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          required: [true, "questionId is required"],
        },

        selectedAnswer: {
          type: String,
          required: [true, "Selected answer is required"],
        },

        correctAnswer: {
          type: String,
          required: [true, "Correct answer is required"],
        },

        isCorrect: {
          type: Boolean,
          required: true,
        },

        topic: {
          type: String,
          required: [true, "Topic is required"],
        },

        explanation: {
          type: String,
          required: [true, "Explanation is required"],
        },
      },
    ],

    score: {
      type: Number,
      required: [true, "Score is required"],
    },

    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
    },

    weakAreas: [
      {
        topic: {
          type: String,
          required: [true, "Weak area topic is required"],
        },

        correct: {
          type: Number,
          required: true,
        },

        total: {
          type: Number,
          required: true,
        },

        accuracy: {
          type: Number,
          required: true,
        },

        mastered: {
          type: Boolean,
          default: false,
        },
      },
    ],

    marking: {
      enabled: { type: Boolean, default: false },
      correctMarks: { type: Number, default: 1 },
      negativeMarks: { type: Number, default: 0 },
    },

    topicMastery: [
      {
        topic: { type: String, required: true },
        correct: { type: Number, required: true },
        total: { type: Number, required: true },
        accuracy: { type: Number, required: true },
        mastered: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const QuizAttemptModel =
  mongoose.models.quizAttempt ||
  model("quizAttempt", QuizAttemptSchema);
