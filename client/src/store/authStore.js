import { create } from "zustand";
import { authService } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const res = await authService.getMe();
      if (res.data.success && res.data.data.user) {
        set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await authService.login({ email, password });
      if (res.data.success) {
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async ({ Fname, Lname, email, password }) => {
    try {
      set({ loading: true, error: null });
      const res = await authService.register({ Fname, Lname, email, password });
      if (res.data.success) {
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
