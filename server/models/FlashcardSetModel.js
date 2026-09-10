import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const FlashcardSetSchema = new Schema(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "note",
      required: [true, "noteId is required"],
    },

    cards: [
      {
        question: {
          type: String,
          required: [true, "Flashcard question is required"],
        },

        answer: {
          type: String,
          required: [true, "Flashcard answer is required"],
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

export const FlashcardSetModel =
  mongoose.models.flashcardSet ||
  model("flashcardSet", FlashcardSetSchema);
