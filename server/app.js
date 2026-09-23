import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/common/authRoutes.js";
import noteRoutes from "./routes/common/noteRoutes.js";
import mentorRoutes from "./routes/mentor/mentorRoutes.js";
import adminRoutes from "./routes/common/adminRoutes.js";
import { sendError } from "./utils/apiResponse.js";

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev access
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Pocket Mentor API",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes as specified in section 10 & 11
app.use("/api/common/auth", authRoutes);
app.use("/api/common/notes", noteRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use("*", (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Unhandled Express Error]", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  sendError(res, status, message);
});

export default app;
