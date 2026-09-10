import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const UserSchema = new Schema(
  {
    role: {
      type: String,
      required: [true, "role is required"],
      default: "USER",
    },

    Fname: {
      type: String,
      required: [true, "First name is required"],
    },

    Lname: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email should be unique"],
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    isUserActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const UserModel =
  mongoose.models.user || model("user", UserSchema);
