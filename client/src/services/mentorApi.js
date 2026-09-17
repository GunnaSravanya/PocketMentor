import { api, mentorService } from "./api.js";

/**
 * Mentor API Service for persistent AI study mentor interactions
 */
export const mentorApi = {
  sendChatMessage: (data) => api.post("/api/mentor/chat", data),
  getConversations: () => api.get("/api/mentor/conversations"),
  getConversation: (conversationId) => api.get(`/api/mentor/conversations/${conversationId}`),
  deleteConversation: (conversationId) => api.delete(`/api/mentor/conversations/${conversationId}`),
  renameConversation: (conversationId, title) => api.patch(`/api/mentor/conversations/${conversationId}`, { title }),
  
  // Re-export full mentor suite
  ...mentorService,
};

export default mentorApi;
