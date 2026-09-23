import { create } from "zustand";
import { mentorService } from "../services/api";

export const useQuizStore = create((set) => ({
  activeQuiz: null,
  currentAttempt: null,
  stats: null,
  recentAttempts: [],
  history: [],
  loading: false,
  submitting: false,
  error: null,

  fetchQuiz: async (quizId) => {
    try {
      set({ loading: true, error: null });
      const res = await mentorService.getQuizById(quizId);
      if (res.data.success) {
        set({ activeQuiz: res.data.data.quiz, loading: false });
        return res.data.data.quiz;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load quiz",
        loading: false,
      });
      return null;
    }
  },

  getOrCreateQuizForNote: async (noteId) => {
    try {
      set({ loading: true, error: null });
      const res = await mentorService.getQuiz(noteId);
      if (res.data.success) {
        set({ activeQuiz: res.data.data.quiz, loading: false });
        return res.data.data.quiz;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to initialize quiz",
        loading: false,
      });
      return null;
    }
  },

  generateNewQuizForNote: async (noteId) => {
    try {
      set({ loading: true, error: null });
      const res = await mentorService.generateNewQuiz(noteId);
      if (res.data.success) {
        set({ activeQuiz: res.data.data.quiz, loading: false });
        return res.data.data.quiz;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to generate new quiz",
        loading: false,
      });
      return null;
    }
  },

  submitQuiz: async (quizId, answers, marking = null) => {
    try {
      set({ submitting: true, error: null });
      const res = await mentorService.submitQuiz(quizId, answers, marking);
      if (res.data.success) {
        set({ submitting: false });
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit quiz";
      set({ error: msg, submitting: false });
      return { success: false, message: msg };
    }
  },

  fetchAttempt: async (attemptId) => {
    try {
      set({ loading: true, error: null });
      const res = await mentorService.getAttemptById(attemptId);
      if (res.data.success) {
        set({ currentAttempt: res.data.data.attempt, loading: false });
        return res.data.data.attempt;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load attempt results",
        loading: false,
      });
      return null;
    }
  },

  fetchStats: async () => {
    try {
      const res = await mentorService.getStats();
      if (res.data.success) {
        set({
          stats: res.data.data.stats,
          recentAttempts: res.data.data.recentAttempts || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  },

  fetchHistory: async () => {
    try {
      set({ loading: true, error: null });
      const res = await mentorService.getHistory();
      if (res.data.success) {
        set({ history: res.data.data.history, loading: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load history",
        loading: false,
      });
    }
  },
}));
