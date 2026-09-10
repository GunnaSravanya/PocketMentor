import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "userId is required"],
    },

    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
    },

    sourceType: {
      type: String,
      enum: ["file", "text"],
      required: [true, "source type is required"],
    },

    fileName: {
      type: String,
    },

    fileUrl: {
      type: String,
    },

    fileType: {
      type: String,
    },

    extractedText: {
      type: String,
      required: [true, "Extracted text is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const NoteModel =
  mongoose.models.note || model("note", NoteSchema);
