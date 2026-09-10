import bcrypt from "bcryptjs";
import { UserModel } from "../models/UserModel.js";
import { generateToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const register = async (req, res) => {
  try {
    const { Fname, Lname, email, password } = req.body;

    if (!Fname || !email || !password) {
      return sendError(res, 400, "First name, email, and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 409, "Email is already registered. Please log in.");
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      Fname: Fname.trim(),
      Lname: Lname ? Lname.trim() : "",
      email: normalizedEmail,
      password: hashedPassword,
      role: "USER",
      isUserActive: true,
    });

    const token = generateToken(newUser._id, newUser.role);
    setAuthCookie(res, token);

    const userSafe = {
      _id: newUser._id,
      Fname: newUser.Fname,
      Lname: newUser.Lname,
      email: newUser.email,
      role: newUser.role,
      isUserActive: newUser.isUserActive,
      createdAt: newUser.createdAt,
    };

    return sendSuccess(res, 201, "Registration successful", { user: userSafe });
  } catch (error) {
    console.error("[Register Error]", error);
    return sendError(res, 500, error.message || "Registration failed");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    if (!user.isUserActive) {
      return sendError(res, 403, "Account is inactive. Please contact administrator.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    const userSafe = {
      _id: user._id,
      Fname: user.Fname,
      Lname: user.Lname,
      email: user.email,
      role: user.role,
      isUserActive: user.isUserActive,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, 200, "Login successful", { user: userSafe });
  } catch (error) {
    console.error("[Login Error]", error);
    return sendError(res, 500, error.message || "Login failed");
  }
};

export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    console.error("[Logout Error]", error);
    return sendError(res, 500, "Logout failed");
  }
};

export const getMe = async (req, res) => {
  try {
    const userSafe = {
      _id: req.user._id,
      Fname: req.user.Fname,
      Lname: req.user.Lname,
      email: req.user.email,
      role: req.user.role,
      isUserActive: req.user.isUserActive,
      createdAt: req.user.createdAt,
    };
    return sendSuccess(res, 200, "User profile retrieved", { user: userSafe });
  } catch (error) {
    console.error("[GetMe Error]", error);
    return sendError(res, 500, "Failed to retrieve user profile");
  }
};
