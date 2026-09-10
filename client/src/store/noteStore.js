import { create } from "zustand";
import { noteService } from "../services/api";

export const useNoteStore = create((set, get) => ({
  notes: [],
  activeNote: null,
  activeNoteDetails: null, // includes summary, flashcards, quizzes
  loading: false,
  uploading: false,
  error: null,

  fetchNotes: async () => {
    try {
      set({ loading: true, error: null });
      const res = await noteService.getNotes();
      if (res.data.success) {
        set({ notes: res.data.data.notes, loading: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch notes",
        loading: false,
      });
    }
  },

  fetchNoteById: async (noteId) => {
    try {
      set({ loading: true, error: null });
      const res = await noteService.getNoteById(noteId);
      if (res.data.success) {
        set({
          activeNote: res.data.data.note,
          activeNoteDetails: res.data.data,
          loading: false,
        });
        return res.data.data;
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch note",
        loading: false,
      });
      return null;
    }
  },

  createNote: async (formDataOrJson, isMultipart = false) => {
    try {
      set({ uploading: true, error: null });
      const res = await noteService.createNote(formDataOrJson, isMultipart);
      if (res.data.success) {
        set({ uploading: false });
        // Refresh notes list
        get().fetchNotes();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create note";
      set({ error: msg, uploading: false });
      return { success: false, message: msg };
    }
  },

  deleteNote: async (noteId) => {
    try {
      set({ loading: true });
      const res = await noteService.deleteNote(noteId);
      if (res.data.success) {
        set((state) => ({
          notes: state.notes.filter((n) => n._id !== noteId),
          activeNote: state.activeNote?._id === noteId ? null : state.activeNote,
          loading: false,
        }));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete note";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  clearActiveNote: () => set({ activeNote: null, activeNoteDetails: null }),
}));
