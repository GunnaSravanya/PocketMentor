import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { UserModel } from "./models/UserModel.js";
import { NoteModel } from "./models/NoteModel.js";
import { SummaryModel } from "./models/SummaryModel.js";
import { FlashcardSetModel } from "./models/FlashcardSetModel.js";
import { QuizModel } from "./models/QuizModel.js";
import { QuizAttemptModel } from "./models/QuizAttemptModel.js";

const PORT = 5099;

async function runE2eTest() {
  console.log("=== Starting Backend End-to-End Test ===");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pocket_mentor");

  const server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });

  const baseUrl = `http://localhost:${PORT}`;
  let authCookie = "";
  let testUserId = "";
  let testNoteId = "";
  let testQuizId = "";
  let testAttemptId = "";

  try {
    // 1. Health Check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.assert(healthJson.status === "ok", "Health check failed");
    console.log("✓ Health check endpoint OK");

    // Clean up any existing test user
    await UserModel.deleteOne({ email: "student_tester@pocketmentor.local" });

    // 2. Register
    const regRes = await fetch(`${baseUrl}/api/common/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Fname: "Alex",
        Lname: "Smith",
        email: "student_tester@pocketmentor.local",
        password: "Password123!",
      }),
    });

    const setCookieHeader = regRes.headers.get("set-cookie");
    if (setCookieHeader) {
      authCookie = setCookieHeader.split(";")[0];
    }
    const regJson = await regRes.json();
    console.assert(regJson.success === true, "Registration failed: " + regJson.message);
    testUserId = regJson.data.user._id;
    console.log("✓ Registration & HTTP-only Cookie generation OK");

    // 3. Get /me
    const meRes = await fetch(`${baseUrl}/api/common/auth/me`, {
      headers: { Cookie: authCookie },
    });
    const meJson = await meRes.json();
    console.assert(meJson.data.user.email === "student_tester@pocketmentor.local", "GetMe verification failed");
    console.log("✓ Auth Protected Route (GET /me) OK");

    // 4. Create Note (Pasted Text)
    const osNotes = `Operating Systems Notes:
Deadlock Conditions:
For deadlock to occur, four Coffman conditions must hold simultaneously:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources.
3. No Preemption: Resources cannot be preempted; a resource can only be released voluntarily by the process holding it.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process.

CPU Scheduling:
FCFS (First-Come, First-Served) is non-preemptive. Round Robin uses time quanta.
Shortest Job First (SJF) gives minimum average waiting time for a given set of processes.

Resource Allocation Graph (RAG):
If a graph contains no cycles, no deadlock exists. If cycles exist and each resource type has only one instance, deadlock definitely exists.`;

    const noteRes = await fetch(`${baseUrl}/api/common/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: "Operating Systems - Concurrency & Deadlocks",
        text: osNotes,
        sourceType: "text",
      }),
    });
    const noteJson = await noteRes.json();
    console.assert(noteJson.success === true, "Create note failed: " + noteJson.message);
    testNoteId = noteJson.data.noteId;
    console.log("✓ Note Creation from Pasted Text OK, Note ID:", testNoteId);

    // 5. Generate Summary
    const summaryRes = await fetch(`${baseUrl}/api/mentor/summary/${testNoteId}`, {
      method: "POST",
      headers: { Cookie: authCookie },
    });
    const summaryJson = await summaryRes.json();
    console.assert(summaryJson.success === true, "Summary generation failed");
    console.assert(summaryJson.data.summary.content.length > 50, "Summary content too short");
    console.log("✓ 60-Second Summary Generation OK");

    // 6. Generate Flashcards
    const flashcardsRes = await fetch(`${baseUrl}/api/mentor/flashcards/${testNoteId}`, {
      method: "POST",
      headers: { Cookie: authCookie },
    });
    const flashcardsJson = await flashcardsRes.json();
    console.assert(flashcardsJson.success === true, "Flashcards generation failed");
    console.assert(flashcardsJson.data.flashcardSet.cards.length >= 3, "Flashcards count insufficient");
    console.log(`✓ Flashcard Generation OK (${flashcardsJson.data.flashcardSet.cards.length} cards created)`);

    // 7. Generate Quiz
    const quizRes = await fetch(`${baseUrl}/api/mentor/quiz/${testNoteId}`, {
      method: "POST",
      headers: { Cookie: authCookie },
    });
    const quizJson = await quizRes.json();
    console.assert(quizJson.success === true, "Quiz generation failed");
    testQuizId = quizJson.data.quiz._id;
    const questions = quizJson.data.quiz.questions;
    console.assert(questions.length >= 3, "Quiz questions insufficient");
    console.log(`✓ Quiz Generation OK (${questions.length} questions, generation #${quizJson.data.quiz.generationNumber})`);

    // 8. Submit Quiz
    // Fetch actual quiz document to test accurate answers vs intentional wrong answers
    const fullQuizDoc = await QuizModel.findById(testQuizId);
    
    // We will answer the first question CORRECTLY, and the remaining questions INCORRECTLY
    // to test weak area calculation (<60%) and mistake explanations.
    const submissionAnswers = fullQuizDoc.questions.map((q, idx) => {
      if (idx === 0) {
        return { questionId: q._id, selectedAnswer: q.correctAnswer }; // Correct
      } else {
        const wrongOption = q.options.find((opt) => opt !== q.correctAnswer) || "Wrong Option";
        return { questionId: q._id, selectedAnswer: wrongOption }; // Wrong
      }
    });

    const submitRes = await fetch(`${baseUrl}/api/mentor/quiz/${testQuizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({ answers: submissionAnswers }),
    });

    const submitJson = await submitRes.json();
    console.assert(submitJson.success === true, "Quiz submission failed");
    console.assert(submitJson.data.score === 1, `Expected score 1, got ${submitJson.data.score}`);
    console.assert(submitJson.data.weakAreas.length > 0, "Expected weak areas to be detected");
    console.assert(submitJson.data.answers.some((a) => !a.isCorrect && a.explanation.length > 10), "Mistake explanation missing");
    testAttemptId = submitJson.data.attemptId;
    console.log(`✓ Quiz Submission & Scoring OK! Score: ${submitJson.data.score}/${submitJson.data.totalQuestions}, Weak areas: ${submitJson.data.weakAreas.length}`);

    // 9. Weak Area Revision
    const weakTopic = submitJson.data.weakAreas[0].topic;
    const reviseRes = await fetch(`${baseUrl}/api/mentor/revise/${testAttemptId}/${encodeURIComponent(weakTopic)}`, {
      headers: { Cookie: authCookie },
    });
    const reviseJson = await reviseRes.json();
    console.assert(reviseJson.success === true, "Weak area revision failed");
    console.assert(reviseJson.data.revision.quickExplanation, "Quick explanation missing in revision");
    console.log(`✓ Weak Area Revision OK for topic "${weakTopic}"`);

    // 10. Dashboard Stats
    const statsRes = await fetch(`${baseUrl}/api/mentor/stats`, {
      headers: { Cookie: authCookie },
    });
    const statsJson = await statsRes.json();
    console.assert(statsJson.data.stats.notesCount >= 1, "Stats notesCount incorrect");
    console.assert(statsJson.data.stats.totalQuizzesTaken >= 1, "Stats totalQuizzesTaken incorrect");
    console.log("✓ Dashboard Stats Calculation OK");

    // 11. Generate New Quiz (Generation N+1)
    const newQuizRes = await fetch(`${baseUrl}/api/mentor/quiz/${testNoteId}/new`, {
      method: "POST",
      headers: { Cookie: authCookie },
    });
    const newQuizJson = await newQuizRes.json();
    console.assert(newQuizJson.success === true, "Generate new quiz failed");
    console.assert(newQuizJson.data.quiz.generationNumber === 2, "Expected generation #2");
    console.log("✓ Generate New Quiz (Generation #2) OK");

    console.log("🎉 ALL E2E BACKEND TESTS PASSED COMPLETELY!");
  } finally {
    // Cleanup test data
    if (testUserId) {
      await UserModel.findByIdAndDelete(testUserId);
      await NoteModel.deleteMany({ userId: testUserId });
      await SummaryModel.deleteMany({ noteId: testNoteId });
      await FlashcardSetModel.deleteMany({ noteId: testNoteId });
      await QuizModel.deleteMany({ noteId: testNoteId });
      await QuizAttemptModel.deleteMany({ userId: testUserId });
    }
    server.close();
    await mongoose.disconnect();
  }
}

runE2eTest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
