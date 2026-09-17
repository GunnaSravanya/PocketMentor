import { create } from "zustand";
import { mentorApi } from "../services/mentorApi";

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  /**
   * Fetch user's conversation history
   */
  fetchConversations: async () => {
    try {
      const res = await mentorApi.getConversations();
      if (res.data.success) {
        set({
          conversations: res.data.data.conversations || [],
          error: null,
        });
      }
    } catch (err) {
      console.error("[ChatStore fetchConversations error]", err);
      set({ error: err.response?.data?.message || "Failed to load chat history" });
    }
  },

  /**
   * Load an existing conversation and its messages
   */
  loadConversation: async (conversationId) => {
    if (!conversationId) return;
    try {
      set({ isLoading: true, error: null });
      const res = await mentorApi.getConversation(conversationId);
      if (res.data.success && res.data.data.conversation) {
        const conv = res.data.data.conversation;
        set({
          currentConversation: conv,
          messages: conv.messages || [],
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("[ChatStore loadConversation error]", err);
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to load conversation",
      });
    }
  },

  /**
   * Send message to AI Study Mentor with context
   */
  sendMessage: async (text, noteId = null) => {
    const trimmed = text.trim();
    if (!trimmed || get().isSending) return;

    const { currentConversation, messages, conversations } = get();

    const optimisticUserMsg = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...messages, optimisticUserMsg],
      isSending: true,
      error: null,
    });

    try {
      const payload = {
        message: trimmed,
        conversationId: currentConversation?._id || undefined,
        noteId: noteId || currentConversation?.noteId || undefined,
      };

      const res = await mentorApi.sendChatMessage(payload);

      if (res.data.success && res.data.data) {
        const { conversationId, title, noteId: savedNoteId, messages: serverMessages, message: aiMsg } =
          res.data.data;

        const updatedMessages = serverMessages && serverMessages.length > 0
          ? serverMessages
          : [...get().messages, aiMsg];

        const updatedCurrentConv = {
          ...(currentConversation || {}),
          _id: conversationId,
          title: title || currentConversation?.title || "Study Session",
          noteId: savedNoteId || currentConversation?.noteId || null,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        };

        // Update or insert conversation into conversations list
        let updatedConversations = [...conversations];
        const existingIdx = updatedConversations.findIndex((c) => c._id === conversationId);
        const convSummary = {
          _id: conversationId,
          title: updatedCurrentConv.title,
          noteId: savedNoteId,
          messageCount: updatedMessages.length,
          lastMessage: aiMsg?.content?.slice(0, 120) || trimmed.slice(0, 120),
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          updatedConversations.splice(existingIdx, 1);
        }
        updatedConversations.unshift(convSummary);

        set({
          currentConversation: updatedCurrentConv,
          messages: updatedMessages,
          conversations: updatedConversations,
          isSending: false,
        });

        return { success: true };
      }
    } catch (err) {
      console.error("[ChatStore sendMessage error]", err);
      const errMsg = err.response?.data?.message || "I'm having trouble connecting to the AI right now. Please try again in a moment.";
      set({
        isSending: false,
        error: errMsg,
      });
      return { success: false, message: errMsg };
    }
  },

  /**
   * Start a new chat session
   */
  createNewChat: () => {
    set({
      currentConversation: null,
      messages: [],
      error: null,
      isLoading: false,
      isSending: false,
    });
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId) => {
    if (!conversationId) return;
    try {
      await mentorApi.deleteConversation(conversationId);
      const { currentConversation, conversations } = get();
      const filtered = conversations.filter((c) => c._id !== conversationId);

      set({ conversations: filtered });

      if (currentConversation?._id === conversationId) {
        get().createNewChat();
      }
    } catch (err) {
      console.error("[ChatStore deleteConversation error]", err);
      set({ error: err.response?.data?.message || "Failed to delete conversation" });
    }
  },

  /**
   * Clear current chat view
   */
  clearCurrentChat: () => {
    set({ messages: [], error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useChatStore;
