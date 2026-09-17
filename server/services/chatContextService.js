/**
 * Chat Context Service
 * Prepares system instructions, conversation summary, selected note context,
 * and bounded recent conversation messages for Grok AI.
 */

/**
 * Cleanly derives a concise conversation title from the first user message
 * without needing an extra AI API call.
 */
export const generateConversationTitle = (message) => {
  if (!message || typeof message !== "string") return "New Chat";

  let clean = message.trim();

  // Strip common conversational question prefixes
  const prefixRegex =
    /^(can you\s+)?(please\s+)?(tell me about|explain to me|explain|what is|what are|how does|how to|describe|define|why is|why does|give me an example of|help me understand|i want to learn about|could you explain|hi|hello|hey)\s+/i;

  clean = clean.replace(prefixRegex, "").trim();

  // Remove trailing punctuation marks
  clean = clean.replace(/[?!.:;,]+$/, "").trim();

  if (!clean) {
    clean = message.trim().slice(0, 30);
  }

  // Capitalize first letter of each significant word
  const words = clean.split(/\s+/).slice(0, 5);
  const title = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return title.length > 35 ? title.slice(0, 32) + "..." : title || "Study Question";
};

/**
 * Build the AI system prompt and messages list
 */
export const buildChatContext = ({ conversation, note, currentMessage }) => {
  let systemPrompt = `You are Pocket Mentor — an intelligent, encouraging, and highly competent AI Study Mentor.
Your goal is to guide the student to master their academic material through active recall, clear explanations, and targeted exam preparation.

CORE BEHAVIORAL RULES:
1. Conversation Continuity: You maintain full context of this ongoing conversation. Understand follow-up questions, pronouns, and references (such as "why?", "explain that again", "what about the second one?", "compare them", "give another example") using previous messages.
2. Direct & Substantive: Do NOT use repetitive filler phrases like "Great question!", "Certainly!", or "I'd be happy to help with that". Start immediately with the helpful answer.
3. Pedagogical Clarity: Explain concepts clearly using intuitive intuition first, then structured bullet points or step-by-step breakdowns. Use relatable analogies when helpful.
4. Depth on Demand: Be concise and digestible by default. When the student asks for more depth or mathematical/technical rigor, provide thorough, in-depth explanations.
5. Accuracy & Misconceptions: If the student holds a misconception or incorrect premise, gently correct it and explain why.`;

  // Note-Aware Context Injection
  if (note && note.extractedText) {
    const noteTextSnippet = note.extractedText.slice(0, 8000);
    systemPrompt += `\n\n---
ACTIVE STUDY NOTE CONTEXT:
Title: "${note.title}"
${noteTextSnippet}
---
NOTE-AWARE INSTRUCTIONS:
- Ground your answers in the student's study note above whenever the question relates to it.
- Never fabricate or claim that information was in the note if it was not. If the student asks about a concept not covered in their notes, explain it using general academic knowledge while clearly clarifying that it's additional context beyond their notes.`;
  }

  // Long Conversation Summary Injection (if older messages have been summarized)
  if (conversation?.conversationSummary && conversation.conversationSummary.trim()) {
    systemPrompt += `\n\n---
PREVIOUS CONVERSATION BACKGROUND SUMMARY:
${conversation.conversationSummary.trim()}
---`;
  }

  // Construct bounded recent messages (last 12 messages = ~6 exchanges)
  const recentHistory = (conversation?.messages || [])
    .slice(-12)
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: String(msg.content),
    }));

  // Append current user message
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: currentMessage.trim() },
  ];

  return {
    systemPrompt,
    messages: fullMessages,
  };
};

/**
 * Updates the conversation summary when conversations grow long (>14 messages)
 * without making external API calls if a simple condensation is preferred.
 */
export const maybeUpdateConversationSummary = (conversation) => {
  if (!conversation || !Array.isArray(conversation.messages)) return;

  const total = conversation.messages.length;
  // If conversation has more than 14 messages, summarize older messages beyond the last 10
  if (total > 14) {
    const olderMessages = conversation.messages.slice(0, total - 10);
    const keyTopics = olderMessages
      .filter((m) => m.role === "user")
      .map((m) => m.content.slice(0, 60))
      .slice(-4);

    if (keyTopics.length > 0) {
      conversation.conversationSummary = `Earlier topics discussed: ${keyTopics.join("; ")}.`;
    }
  }
};
