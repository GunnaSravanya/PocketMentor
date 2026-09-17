import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const ConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "userId is required"],
    },

    noteId: {
      type: Schema.Types.ObjectId,
      ref: "note",
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },

    conversationSummary: {
      type: String,
      default: "",
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: [true, "Message role is required"],
        },

        content: {
          type: String,
          required: [true, "Message content is required"],
        },

        timestamp: {
          type: Date,
          default: Date.now,
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

export const ConversationModel =
  mongoose.models.conversation ||
  model("conversation", ConversationSchema);
