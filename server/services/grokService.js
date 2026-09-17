/**
 * Grok AI Service
 * Communicates with xAI Grok API (https://api.x.ai/v1/chat/completions)
 * Provides structured JSON responses for Summaries, Flashcards, Quizzes, Explanations, and Topic Revision.
 */

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = process.env.GROK_MODEL || "grok-2-latest";

/**
 * Clean JSON output from potential markdown code fences
 */
const cleanJsonString = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

/**
 * Call Grok / Groq completions endpoint
 */
const executeGrokCall = async (systemPrompt, userPrompt, temperature = 0.2) => {
  const apiKey = process.env.GROK_API_KEY?.trim();

  if (!apiKey || apiKey === "your_grok_api_key_here") {
    console.warn("[Grok Service] GROK_API_KEY is not configured. Falling back to local study material generator.");
    return null;
  }

  // Auto-detect whether key is Groq (starts with gsk_) or xAI Grok (starts with xai-)
  const isGroqKey = apiKey.startsWith("gsk_");
  const apiUrl = isGroqKey
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.x.ai/v1/chat/completions";

  let modelName = (process.env.GROK_MODEL || "").trim();
  if (isGroqKey) {
    // When using Groq key, default to qwen/qwen3.8-27b or user override
    if (!modelName || modelName.includes("grok")) {
      modelName = "qwen/qwen3.8-27b";
    }
  } else {
    modelName = modelName || "grok-2-latest";
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Empty response received from AI API");
  }

  return cleanJsonString(rawContent);
};

/**
/**
 * Call Grok / Groq for multi-turn conversational chat
 */
export const executeGrokChat = async (messages, temperature = 0.5) => {
  const apiKey = process.env.GROK_API_KEY?.trim();

  if (!apiKey || apiKey === "your_grok_api_key_here") {
    throw new Error("I'm having trouble connecting to the AI right now. Please try again in a moment.");
  }

  const isGroqKey = apiKey.startsWith("gsk_");
  const apiUrl = isGroqKey
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.x.ai/v1/chat/completions";

  let modelName = (process.env.GROK_MODEL || "").trim();
  if (isGroqKey) {
    if (!modelName || modelName.includes("grok")) {
      modelName = "qwen/qwen3.8-27b";
    }
  } else {
    modelName = modelName || "grok-2-latest";
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI Chat API Error] (${response.status}):`, errorText);
    if (response.status === 429) {
      throw new Error("AI service rate limit reached. Please wait a moment and try again.");
    }
    throw new Error("I'm having trouble connecting to the AI right now. Please try again in a moment.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("I'm having trouble connecting to the AI right now. Please try again in a moment.");
  }
  return content.trim();
};

// ==========================================
// 1. SUMMARY GENERATION
// ==========================================
export const generateSummaryFromNotes = async (extractedText) => {
  const systemPrompt = `You are Pocket Mentor, an expert academic tutor.
Your task is to create a concise, high-yield revision summary suitable for a 60-second explanation (approx 150-250 words).
Focus on core concepts, definitions, formulas, and key takeaways.
Preserve technical accuracy and avoid conversational filler.
Respond with ONLY a JSON object in this exact format:
{
  "summary": "Full formatted text of the 60-second summary here..."
}`;

  const userPrompt = `Generate a 60-second study summary from the following notes:\n\n${extractedText.slice(0, 12000)}`;

  try {
    const jsonStr = await executeGrokCall(systemPrompt, userPrompt);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (parsed.summary && typeof parsed.summary === "string" && parsed.summary.trim().length > 20) {
        return parsed.summary.trim();
      }
    }
  } catch (err) {
    console.error("[Grok Summary Generation Warning]", err.message);
  }

  // Fallback generation from extracted text
  return createFallbackSummary(extractedText);
};

// ==========================================
// 2. FLASHCARDS GENERATION
// ==========================================
export const generateFlashcardsFromNotes = async (extractedText) => {
  const systemPrompt = `You are Pocket Mentor, an expert revision assistant.
Generate 5 to 10 high-value study flashcards from the provided notes.
Focus on key definitions, core concepts, critical formulas, differences, and conceptual questions.
Each flashcard must have a clear question and a concise, precise answer.
Respond with ONLY a JSON object in this exact format:
{
  "cards": [
    {
      "question": "Clear question here?",
      "answer": "Concise answer here."
    }
  ]
}`;

  const userPrompt = `Create revision flashcards from the following notes:\n\n${extractedText.slice(0, 12000)}`;

  try {
    const jsonStr = await executeGrokCall(systemPrompt, userPrompt);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        const validatedCards = parsed.cards.filter(
          (c) => c.question && c.answer && typeof c.question === "string" && typeof c.answer === "string"
        );
        if (validatedCards.length > 0) {
          return validatedCards;
        }
      }
    }
  } catch (err) {
    console.error("[Grok Flashcards Warning]", err.message);
  }

  return createFallbackFlashcards(extractedText);
};

// ==========================================
// 3. QUIZ GENERATION
// ==========================================
export const generateQuizFromNotes = async (extractedText, generationNumber = 1) => {
  const systemPrompt = `You are Pocket Mentor, an academic assessment specialist.
Generate a rigorous 5 to 10 question Multiple Choice Quiz (MCQ) based on the provided notes.
This is generation #${generationNumber} of the quiz.

RULES:
1. Every question must have exactly 4 options.
2. Exactly one option must be the correctAnswer.
3. The correctAnswer MUST be identical to one of the 4 options.
4. Every question MUST have a specific 'topic' (e.g., 'Deadlock Conditions', 'CPU Scheduling', 'Memory Management').
   This topic is critical for identifying weak areas.
5. Provide high-quality academic questions with plausible distractors.

Respond with ONLY a JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "topic": "Topic Name"
    }
  ]
}`;

  const userPrompt = `Generate Quiz #${generationNumber} from these study notes:\n\n${extractedText.slice(0, 12000)}`;

  try {
    const jsonStr = await executeGrokCall(systemPrompt, userPrompt);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      const validated = validateQuizStructure(parsed);
      if (validated) return validated;
    }
  } catch (err) {
    console.error("[Grok Quiz Warning]", err.message);
  }

  return createFallbackQuiz(extractedText, generationNumber);
};

/**
 * Validates quiz structure according to Section 34 requirements
 */
export const validateQuizStructure = (parsed) => {
  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    return null;
  }

  const validQuestions = [];
  for (const q of parsed.questions) {
    if (
      !q.question ||
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.correctAnswer ||
      !q.topic
    ) {
      continue;
    }

    // Ensure correctAnswer is one of options
    const normalizedOptions = q.options.map((opt) => String(opt).trim());
    const normalizedCorrect = String(q.correctAnswer).trim();
    if (!normalizedOptions.includes(normalizedCorrect)) {
      continue;
    }

    validQuestions.push({
      question: q.question.trim(),
      options: normalizedOptions,
      correctAnswer: normalizedCorrect,
      topic: String(q.topic).trim(),
    });
  }

  return validQuestions.length >= 3 ? validQuestions : null;
};

// ==========================================
// 4. INCORRECT ANSWER EXPLANATIONS
// ==========================================
export const generateExplanationsForMistakes = async (incorrectItems, notesText = "") => {
  if (!incorrectItems || incorrectItems.length === 0) return {};

  const systemPrompt = `You are Pocket Mentor, an encouraging academic tutor.
For each student's incorrect question answer below, provide a clear, pedagogical explanation explaining:
1. Why the selected answer is incorrect.
2. Why the correct answer is right according to the study notes.
Keep each explanation concise (2 to 4 sentences).

Respond with ONLY a JSON object mapping each question index to its explanation:
{
  "explanations": [
    {
      "index": 0,
      "explanation": "Mutual exclusion means a resource can only be held by one process at a time..."
    }
  ]
}`;

  const promptItems = incorrectItems.map((item, idx) => ({
    index: idx,
    question: item.question,
    selectedAnswer: item.selectedAnswer,
    correctAnswer: item.correctAnswer,
    topic: item.topic,
  }));

  const userPrompt = `Notes Context:\n${(notesText || "").slice(0, 5000)}\n\nQuestions to explain:\n${JSON.stringify(promptItems, null, 2)}`;

  try {
    const jsonStr = await executeGrokCall(systemPrompt, userPrompt);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.explanations)) {
        const resultMap = {};
        parsed.explanations.forEach((item) => {
          if (item.explanation && typeof item.index === "number") {
            resultMap[item.index] = item.explanation.trim();
          }
        });
        return resultMap;
      }
    }
  } catch (err) {
    console.error("[Grok Explanations Warning]", err.message);
  }

  // Fallback explanation generator
  const fallbackMap = {};
  incorrectItems.forEach((item, idx) => {
    fallbackMap[idx] = `"${item.correctAnswer}" is the correct concept under ${item.topic}. "${item.selectedAnswer}" does not satisfy this principle in the study context.`;
  });
  return fallbackMap;
};

// ==========================================
// 5. WEAK AREA TARGETED REVISION
// ==========================================
export const generateWeakAreaRevision = async (topic, extractedText) => {
  const systemPrompt = `You are Pocket Mentor.
A student struggled with the topic "${topic}" in their recent quiz.
Create a targeted mini-revision module strictly based on their study notes:
1. Quick explanation (2-3 sentences).
2. 3-4 Key Concepts/Takeaways.
3. 2 Related Flashcards (question and answer).
4. 1 Mini Practice question with 4 options, correctAnswer, and explanation.

Respond with ONLY a JSON object in this format:
{
  "topic": "${topic}",
  "quickExplanation": "...",
  "importantConcepts": ["Concept 1", "Concept 2"],
  "relatedFlashcards": [
    {"question": "...", "answer": "..."}
  ],
  "practiceQuestion": {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "..."
  }
}`;

  const userPrompt = `Study Notes:\n${extractedText.slice(0, 12000)}\n\nCreate weak area revision for: ${topic}`;

  try {
    const jsonStr = await executeGrokCall(systemPrompt, userPrompt);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (parsed.quickExplanation && Array.isArray(parsed.importantConcepts)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("[Grok Revision Warning]", err.message);
  }

  // Fallback revision
  return {
    topic,
    quickExplanation: `Reviewing ${topic}: Focus on the fundamental rules and interactions described in your notes.`,
    importantConcepts: [
      `Key definition and conditions governing ${topic}`,
      `How ${topic} interacts with surrounding system components`,
      `Common pitfalls and distinguishing characteristics of ${topic}`,
    ],
    relatedFlashcards: [
      {
        question: `What is the core principle of ${topic}?`,
        answer: `The primary rule or mechanism underlying ${topic} according to your notes.`,
      },
    ],
    practiceQuestion: {
      question: `Which statement best describes ${topic}?`,
      options: [
        `Standard definition according to notes`,
        `Incorrect alternative description`,
        `Unrelated system characteristic`,
        `Contradictory condition`,
      ],
      correctAnswer: `Standard definition according to notes`,
      explanation: `This statement accurately reflects the definition of ${topic}.`,
    },
  };
};

// ==========================================
// FALLBACK GENERATORS (for offline/demo)
// ==========================================
function createFallbackSummary(text) {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
  const selected = sentences.slice(0, 6).join(" ");
  return (
    selected ||
    "This material covers essential conceptual frameworks, core definitions, and system mechanisms. Key principles include foundational rules, operational lifecycle, performance parameters, and analytical trade-offs. Review these core items thoroughly to prepare for your quiz."
  );
}

function createFallbackFlashcards(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length >= 3) {
    return paragraphs.slice(0, 6).map((p, idx) => {
      const firstSentence = p.split(".")[0];
      return {
        question: `Key Concept #${idx + 1}: What does the following statement describe? "${firstSentence.slice(0, 100)}..."`,
        answer: p.slice(0, 200),
      };
    });
  }

  return [
    {
      question: "What is the primary concept covered in these notes?",
      answer: "The fundamental definitions, mechanisms, and operational constraints outlined in the study material.",
    },
    {
      question: "Why is understanding this topic critical?",
      answer: "It provides the foundational framework for analyzing system behaviors and solving domain problems.",
    },
    {
      question: "What are the key trade-offs discussed?",
      answer: "Efficiency, resource utilization, correctness, and latency constraints.",
    },
  ];
}

function createFallbackQuiz(text, generationNumber) {
  return [
    {
      question: `[Gen ${generationNumber}] Which of the following is a primary principle emphasized in the notes?`,
      options: [
        "Rigorous verification of system conditions and constraints",
        "Ignoring resource utilization bottlenecks",
        "Random state allocation without scheduling",
        "Disabling all concurrency mechanisms",
      ],
      correctAnswer: "Rigorous verification of system conditions and constraints",
      topic: "Core Fundamentals",
    },
    {
      question: `[Gen ${generationNumber}] How should operations be coordinated according to the material?`,
      options: [
        "Through deterministic protocols and safe state verification",
        "By bypassing access controls during high load",
        "By allowing indefinite wait states across all threads",
        "Through unmonitored shared variables",
      ],
      correctAnswer: "Through deterministic protocols and safe state verification",
      topic: "System Coordination",
    },
    {
      question: `[Gen ${generationNumber}] What is the consequence of violating mutual exclusivity or resource bounds?`,
      options: [
        "Inconsistent states, deadlock, or resource contention",
        "Instantaneous throughput doubling",
        "Zero overhead memory consumption",
        "Automatic hardware fault tolerance",
      ],
      correctAnswer: "Inconsistent states, deadlock, or resource contention",
      topic: "Resource Constraints",
    },
    {
      question: `[Gen ${generationNumber}] Which technique is used to evaluate performance trade-offs?`,
      options: [
        "Quantitative metric analysis and benchmark comparison",
        "Guessing based on arbitrary parameters",
        "Removing all validation stages",
        "Fixed-cost static allocation exclusively",
      ],
      correctAnswer: "Quantitative metric analysis and benchmark comparison",
      topic: "Performance Evaluation",
    },
  ];
}
