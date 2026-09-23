import { create } from "zustand";

export const MENTOR_STATES = {
  IDLE: "IDLE",
  LISTENING: "LISTENING",
  SCANNING: "SCANNING",
  ANALYZING: "ANALYZING",
  THINKING: "THINKING",
  EXPLAINING: "EXPLAINING",
  SUCCESS: "SUCCESS",
  ENCOURAGING: "ENCOURAGING",
  FOCUSED: "FOCUSED",
  WARNING: "WARNING",
  CELEBRATING: "CELEBRATING",
  REVISING: "REVISING",
};

export const useMentorStore = create((set, get) => ({
  // Feature flags and visibility toggles
  isLivingMentorEnabled: JSON.parse(
    localStorage.getItem("VITE_ENABLE_LIVING_MENTOR") ?? "true"
  ),
  isMentorSpaceOpen: false,

  // State Machine
  currentState: MENTOR_STATES.IDLE,
  previousState: MENTOR_STATES.IDLE,
  statusMessage: "Active and monitoring study progress",

  // Granular Contextual Data Layer
  context: {
    activeSubject: null,
    activeTopic: null,
    conceptNodes: [],
    weakTopics: [],
    topicMastery: [],
    accuracy: 100,
    streak: 0,
    speechActive: false,
  },

  // ===== CHAT + CAPTION + SPEECH STATE =====
  chatMessages: [],         // { id, role: 'user' | 'mentor', text, ts }[]
  liveCaption: "",          // Current sentence chunk being spoken
  spokenText: "",           // Full progressive text revealed so far in sync with voice
  isSpeaking: false,        // True while TTS is outputting audio
  isChatLoading: false,     // True while waiting for Grok API response

  // Actions
  setLiveCaption: (caption) => set({ liveCaption: caption }),
  setSpokenText: (text) => set({ spokenText: text }),
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setIsChatLoading: (loading) => set({ isChatLoading: loading }),
  setLivingMentorEnabled: (enabled) => {
    localStorage.setItem("VITE_ENABLE_LIVING_MENTOR", JSON.stringify(enabled));
    set({ isLivingMentorEnabled: enabled });
  },

  setMentorSpaceOpen: (isOpen) => set({ isMentorSpaceOpen: isOpen }),

  setMentorState: (state, statusMessage = null) =>
    set((prev) => {
      if (!MENTOR_STATES[state]) {
        console.warn(`[MentorStore] Attempted to set invalid state: ${state}`);
        return prev;
      }
      return {
        previousState: prev.currentState,
        currentState: state,
        statusMessage: statusMessage || prev.statusMessage,
      };
    }),

  updateContext: (newContext) =>
    set((prev) => ({
      context: { ...prev.context, ...newContext },
    })),

  resetContext: () =>
    set({
      currentState: MENTOR_STATES.IDLE,
      previousState: MENTOR_STATES.IDLE,
      statusMessage: "Ready to assist your revision",
      context: {
        activeSubject: null,
        activeTopic: null,
        conceptNodes: [],
        weakTopics: [],
        topicMastery: [],
        accuracy: 100,
        streak: 0,
        speechActive: false,
      },
    }),

  // Chat actions
  addChatMessage: (role, text) =>
    set((prev) => ({
      chatMessages: [
        ...prev.chatMessages,
        { id: Date.now(), role, text, ts: new Date() },
      ],
    })),

  clearChat: () => set({ chatMessages: [] }),

  setLiveCaption: (caption) => set({ liveCaption: caption }),

  setIsSpeaking: (bool) => set({ isSpeaking: bool }),

  setIsChatLoading: (bool) => set({ isChatLoading: bool }),
}));
