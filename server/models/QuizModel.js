import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const QuizSchema = new Schema(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "note",
      required: [true, "noteId is required"],
    },

    generationNumber: {
      type: Number,
      default: 1,
    },

    questions: [
      {
        question: {
          type: String,
          required: [true, "Question is required"],
        },

        options: {
          type: [String],
          required: [true, "Options are required"],
          validate: {
            validator: function (value) {
              return value.length === 4;
            },
            message: "Each question must have exactly 4 options",
          },
        },

        correctAnswer: {
          type: String,
          required: [true, "Correct answer is required"],
        },

        topic: {
          type: String,
          required: [true, "Question topic is required"],
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const QuizModel =
  mongoose.models.quiz || model("quiz", QuizSchema);
