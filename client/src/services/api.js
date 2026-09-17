import axios from "axios";

// Default API URL (uses Vite proxy in dev, or specified env)
const API_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for HTTP-only cookie JWT auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Common API services
export const authService = {
  register: (data) => api.post("/api/common/auth/register", data),
  login: (data) => api.post("/api/common/auth/login", data),
  logout: () => api.post("/api/common/auth/logout"),
  getMe: () => api.get("/api/common/auth/me"),
};

export const noteService = {
  createNote: (formDataOrJson, isMultipart = false) =>
    api.post("/api/common/notes", formDataOrJson, {
      headers: isMultipart ? { "Content-Type": undefined } : {},
    }),
  getNotes: () => api.get("/api/common/notes"),
  getNoteById: (noteId) => api.get(`/api/common/notes/${noteId}`),
  deleteNote: (noteId) => api.delete(`/api/common/notes/${noteId}`),
};

// Mentor API services
export const mentorService = {
  getSummary: (noteId, regenerate = false) =>
    api.post(`/api/mentor/summary/${noteId}${regenerate ? "?regenerate=true" : ""}`),
  getFlashcards: (noteId, regenerate = false) =>
    api.post(`/api/mentor/flashcards/${noteId}${regenerate ? "?regenerate=true" : ""}`),
  getQuiz: (noteId) => api.post(`/api/mentor/quiz/${noteId}`),
  generateNewQuiz: (noteId) => api.post(`/api/mentor/quiz/${noteId}/new`),
  getQuizById: (quizId) => api.get(`/api/mentor/quiz/${quizId}`),
  submitQuiz: (quizId, answers) =>
    api.post(`/api/mentor/quiz/${quizId}/submit`, { answers }),
  getQuizAttempts: (quizId) => api.get(`/api/mentor/quiz/${quizId}/attempts`),
  getAttemptById: (attemptId) => api.get(`/api/mentor/attempt/${attemptId}`),
  reviseTopic: (attemptId, topic) =>
    api.post(`/api/mentor/revise/${attemptId}/${encodeURIComponent(topic)}`),
  chat: (data) => api.post("/api/mentor/chat", data),
  sendChatMessage: (data) => api.post("/api/mentor/chat", data),
  getConversations: () => api.get("/api/mentor/conversations"),
  getConversation: (conversationId) => api.get(`/api/mentor/conversations/${conversationId}`),
  deleteConversation: (conversationId) => api.delete(`/api/mentor/conversations/${conversationId}`),
  renameConversation: (conversationId, title) => api.patch(`/api/mentor/conversations/${conversationId}`, { title }),
  getStats: () => api.get("/api/mentor/stats"),
  getHistory: () => api.get("/api/mentor/history"),
};
