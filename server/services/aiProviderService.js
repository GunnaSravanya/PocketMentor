/**
 * AI Provider Service Abstraction
 * Wraps primary LLM provider (Groq / Grok) with optional Gemini or local demo fallback
 * Preserves 100% existing functionality while giving configurable flexibility
 */

import {
  generateSummaryFromNotes,
  generateFlashcardsFromNotes,
  generateQuizFromNotes,
  generateExplanationsForMistakes,
  generateWeakAreaRevision,
  executeGrokChat,
} from "./grokService.js";

export const getActiveAiProvider = () => {
  const apiKey = process.env.GROK_API_KEY?.trim();
  const isGroq = apiKey?.startsWith("gsk_");
  const isGrok = apiKey?.startsWith("xai-");

  if (process.env.GEMINI_API_KEY && process.env.AI_PRIMARY_PROVIDER === "gemini") {
    return "gemini";
  }

  if (isGroq) return "groq";
  if (isGrok) return "grok";
  return "demo";
};

export const aiService = {
  getProviderName: getActiveAiProvider,
  generateSummary: generateSummaryFromNotes,
  generateFlashcards: generateFlashcardsFromNotes,
  generateQuiz: generateQuizFromNotes,
  generateExplanations: generateExplanationsForMistakes,
  generateRevision: generateWeakAreaRevision,
  chat: executeGrokChat,
};

export default aiService;
