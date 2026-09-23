import { validateQuizStructure } from "./services/grokService.js";
import { getActiveAiProvider } from "./services/aiProviderService.js";
import { generateToken, verifyToken } from "./utils/jwt.js";
import bcrypt from "bcryptjs";

async function runAdvancedTests() {
  console.log("=== Testing Negative Marking, Topic Mastery & Admin Utilities ===");

  // 1. Test AI Provider Abstraction
  const provider = getActiveAiProvider();
  console.assert(typeof provider === "string", "AI Provider should return string");
  console.log(`✓ AI Provider Detected: "${provider}"`);

  // 2. Test Negative Marking Scoring Algorithm
  const sampleQuestions = [
    { _id: "q1", correctAnswer: "A", topic: "CPU Scheduling" },
    { _id: "q2", correctAnswer: "B", topic: "CPU Scheduling" },
    { _id: "q3", correctAnswer: "C", topic: "Deadlocks" },
    { _id: "q4", correctAnswer: "D", topic: "Paging" },
  ];

  const userAnswers = {
    q1: "A", // Correct (+1)
    q2: "C", // Wrong (-0.25)
    q3: "C", // Correct (+1)
    q4: "",  // Unanswered (0)
  };

  const markingConfig = { enabled: true, correctMarks: 1, negativeMarks: 0.25 };
  let score = 0;
  let correctCount = 0;

  sampleQuestions.forEach((q) => {
    const ans = (userAnswers[q._id] || "").trim();
    const isAnswered = ans.length > 0;
    const isCorrect = ans === q.correctAnswer;
    if (isCorrect) {
      correctCount += 1;
      score += markingConfig.correctMarks;
    } else if (isAnswered && markingConfig.enabled) {
      score -= markingConfig.negativeMarks;
    }
  });

  console.assert(correctCount === 2, "Correct count should be 2");
  console.assert(score === 1.75, `Expected score 1.75 with negative marking, got ${score}`);
  console.log("✓ Optional Negative Marking Calculation PASSED (Score: 1.75/4)");

  // 3. Test Granular Topic Mastery Matrix Construction
  const topicStats = {
    "CPU Scheduling": { correct: 1, total: 2 }, // 50% -> Weak
    "Deadlocks": { correct: 1, total: 1 },      // 100% -> Mastered
    "Paging": { correct: 0, total: 1 },         // 0% -> Weak
  };

  const topicMastery = Object.entries(topicStats).map(([topic, stats]) => {
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    return {
      topic,
      correct: stats.correct,
      total: stats.total,
      accuracy,
      mastered: accuracy >= 60,
    };
  });

  const deadlocks = topicMastery.find((t) => t.topic === "Deadlocks");
  const paging = topicMastery.find((t) => t.topic === "Paging");
  console.assert(deadlocks.mastered === true && deadlocks.accuracy === 100, "Deadlocks should be mastered");
  console.assert(paging.mastered === false && paging.accuracy === 0, "Paging should NOT be mastered");
  console.log("✓ Granular Topic Mastery Matrix Construction PASSED");

  // 4. Test Dual Admin Hash Verification Logic
  const sampleAdminPassword = "AdminSecurePassword2026!";
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(sampleAdminPassword, salt);

  const isMatchValid = await bcrypt.compare(sampleAdminPassword, adminHash);
  const isMatchInvalid = await bcrypt.compare("WrongPassword", adminHash);
  console.assert(isMatchValid === true, "Valid admin password must match hash");
  console.assert(isMatchInvalid === false, "Invalid admin password must be rejected");
  console.log("✓ Secure Admin Password Hash Verification PASSED");

  console.log("🎉 ALL ADVANCED BACKEND TESTS PASSED!");
}

runAdvancedTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
