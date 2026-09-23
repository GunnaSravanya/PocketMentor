import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";
import { UserModel } from "../models/UserModel.js";
import { sendError } from "../utils/apiResponse.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Fallback support for Authorization Bearer header if provided
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, 401, "Not authorized, no token provided");
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, 401, "Not authorized, token invalid or expired");
    }

    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return sendError(res, 401, "User not found");
    }

    if (!user.isUserActive) {
      return sendError(res, 403, "Account is deactivated. Please contact support.");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]", error);
    return sendError(res, 500, "Authentication failure");
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }
  return sendError(res, 403, "Access forbidden. Administrator credentials required.");
};

