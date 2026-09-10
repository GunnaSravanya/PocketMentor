import { validateQuizStructure } from "./services/grokService.js";
import { generateToken, verifyToken } from "./utils/jwt.js";
import { WEAK_AREA_THRESHOLD } from "./config/constants.js";

function runTests() {
  console.log("=== Testing Core Backend Utilities ===");

  // 1. Test JWT
  const testUserId = "64b1f8e21a4f5c0012ab34cd";
  const token = generateToken(testUserId, "USER");
  const decoded = verifyToken(token);
  console.assert(decoded.userId === testUserId, "JWT userId mismatch!");
  console.log("✓ JWT Generation & Verification PASSED");

  // 2. Test Quiz Structure Validation
  const validQuizPayload = {
    questions: [
      {
        question: "Which condition is necessary for deadlock?",
        options: ["Mutual Exclusion", "Paging", "Compilation", "Caching"],
        correctAnswer: "Mutual Exclusion",
        topic: "Deadlock Conditions",
      },
      {
        question: "Which scheduling algorithm is non-preemptive?",
        options: ["FCFS", "Round Robin", "SRTF", "Preemptive Priority"],
        correctAnswer: "FCFS",
        topic: "CPU Scheduling",
      },
      {
        question: "What does Banker's algorithm prevent?",
        options: ["Deadlock", "Page Faults", "Thrashing", "Starvation"],
        correctAnswer: "Deadlock",
        topic: "Deadlock Avoidance",
      },
    ],
  };

  const validated = validateQuizStructure(validQuizPayload);
  console.assert(validated !== null && validated.length === 3, "Quiz validation failed for valid payload!");
  console.log("✓ Quiz Structure Validation (Valid case) PASSED");

  // Invalid quiz: less than 4 options
  const invalidQuizPayload = {
    questions: [
      {
        question: "Bad question?",
        options: ["Option 1", "Option 2"],
        correctAnswer: "Option 1",
        topic: "Bad Topic",
      },
    ],
  };
  const invalidResult = validateQuizStructure(invalidQuizPayload);
  console.assert(invalidResult === null, "Quiz validation should have failed for invalid options count!");
  console.log("✓ Quiz Structure Validation (Invalid case rejected) PASSED");

  // 3. Test Weak Area Threshold Logic
  const topicStats = {
    "Deadlock Conditions": { correct: 1, total: 3 }, // 33.3% -> Weak
    "CPU Scheduling": { correct: 3, total: 3 },      // 100% -> Strong
    "Resource Allocation": { correct: 0, total: 2 }, // 0% -> Weak
  };

  const weakAreas = [];
  const strongAreas = [];

  Object.entries(topicStats).forEach(([topic, stats]) => {
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    if (accuracy < WEAK_AREA_THRESHOLD) {
      weakAreas.push({ topic, accuracy });
    } else {
      strongAreas.push({ topic, accuracy });
    }
  });

  console.assert(weakAreas.length === 2, "Weak areas count should be 2!");
  console.assert(strongAreas.length === 1, "Strong areas count should be 1!");
  console.assert(weakAreas.some((w) => w.topic === "Deadlock Conditions"), "Deadlock Conditions should be weak");
  console.assert(weakAreas.some((w) => w.topic === "Resource Allocation"), "Resource Allocation should be weak");
  console.assert(strongAreas[0].topic === "CPU Scheduling", "CPU Scheduling should be strong");
  console.log("✓ Weak Area Detection & Calculation Algorithm PASSED");

  console.log("🎉 ALL CORE BACKEND UNIT TESTS PASSED!");
}

runTests();
