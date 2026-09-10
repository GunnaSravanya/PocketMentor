import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const SummarySchema = new Schema(
  {
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "note",
      required: [true, "noteId is required"],
    },

    content: {
      type: String,
      required: [true, "Summary content is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const SummaryModel =
  mongoose.models.summary || model("summary", SummarySchema);
