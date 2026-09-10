import jwt from "jsonwebtoken";

const COOKIE_NAME = "pocket_mentor_token";

export const generateToken = (userId, role = "USER") => {
  const secret = process.env.JWT_SECRET || "default_pocket_mentor_jwt_secret_key_12345";
  return jwt.sign({ userId, role }, secret, {
    expiresIn: "7d",
  });
};

export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    path: "/",
  });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || "default_pocket_mentor_jwt_secret_key_12345";
  return jwt.verify(token, secret);
};

export { COOKIE_NAME };
