import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuizStore } from "../store/quizStore";
import { mentorService } from "../services/api";
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Loader2,
  XCircle,
  Sparkles,
  ShieldAlert,
  Bot,
} from "lucide-react";
import { mentorEvents } from "../services/mentorEvents";

export const QuizResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { fetchAttempt, currentAttempt, loading } = useQuizStore();

  const [generatingNew, setGeneratingNew] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (attemptId) {
      fetchAttempt(attemptId);
    }
  }, [attemptId, fetchAttempt]);

  // Notify Living Mentor of quiz completion with topic breakdown
  useEffect(() => {
    if (currentAttempt) {
      mentorEvents.quizCompleted(currentAttempt);
    }
  }, [currentAttempt]);

  if (loading || !currentAttempt) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Calculating your quiz results & diagnostics...</p>
      </div>
    );
  }

  const { score, totalQuestions, percentage, weakAreas, answers, quizId, noteId, noteTitle, generationNumber } =
    currentAttempt;

  // Derive strong areas from answers
  const topicMap = {};
  answers.forEach((ans) => {
    if (!topicMap[ans.topic]) {
      topicMap[ans.topic] = { correct: 0, total: 0 };
    }
    topicMap[ans.topic].total += 1;
    if (ans.isCorrect) {
      topicMap[ans.topic].correct += 1;
    }
  });

  const strongAreas = [];
  Object.entries(topicMap).forEach(([topic, stats]) => {
    const acc = Math.round((stats.correct / stats.total) * 100);
    if (acc >= 60) {
      strongAreas.push({ topic, accuracy: acc, correct: stats.correct, total: stats.total });
    }
  });

  const incorrectAnswers = answers.filter((ans) => !ans.isCorrect);

  const handleRetrySameQuiz = () => {
    navigate(`/app/quiz/${quizId}`);
  };

  const handleGenerateNewQuiz = async () => {
    try {
      setGeneratingNew(true);
      setError("");
      const res = await mentorService.generateNewQuiz(noteId);
      if (res.data.success && res.data.data?.quiz?._id) {
        navigate(`/app/quiz/${res.data.data.quiz._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate new quiz");
      setGeneratingNew(false);
    }
  };

  const firstWeakTopic = weakAreas.length > 0 ? weakAreas[0].topic : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quiz Results • {noteTitle} (Gen #{generationNumber})
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">Performance Diagnostics</h1>
        </div>

        <Link
          to={`/app/notes/${noteId}`}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          View Note Overview
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Score Card */}
      <div className="bg-slate-900/80 rounded-3xl p-8 sm:p-10 border border-slate-800/90 shadow-2xl text-center relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-cyan-500/15 via-brand-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 border relative z-10 shadow-lg ${
            percentage >= 70
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
              : percentage >= 50
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/10"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/10"
          }`}
        >
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 relative z-10">Total Score</span>
        <div className="text-5xl sm:text-6xl font-black text-white tracking-tight my-2 relative z-10">
          {score} <span className="text-slate-600 font-light text-3xl sm:text-4xl">/ {totalQuestions}</span>
        </div>

        {currentAttempt.marking?.enabled && (
          <div className="my-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold relative z-10">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Negative Marking Active (-{currentAttempt.marking.negativeMarks} per mistake)</span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm relative z-10 shadow-inner">
          <span className="text-cyan-400">{percentage}% Mastery</span>
          <span className="text-slate-600">•</span>
          <span>
            {percentage >= 80
              ? "Excellent comprehension!"
              : percentage >= 60
              ? "Good foundation, review weak spots"
              : "Further revision recommended"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 relative z-10">
          {firstWeakTopic && (
            <Link
              to={`/app/quiz/attempt/${attemptId}/revise/${encodeURIComponent(firstWeakTopic)}`}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Revise Weak Areas ({weakAreas.length})</span>
            </Link>
          )}

          <button
            onClick={handleRetrySameQuiz}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Retry Same Quiz</span>
          </button>

          <button
            onClick={handleGenerateNewQuiz}
            disabled={generatingNew}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-60"
          >
            {generatingNew ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Gen #{generationNumber + 1}...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Generate New Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagnostic Areas: Strong vs Weak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800/90 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Strong Areas (≥60% Accuracy)</span>
          </div>

          {strongAreas.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No topics achieved ≥60% in this attempt.</p>
          ) : (
            <div className="space-y-3">
              {strongAreas.map((area) => (
                <div
                  key={area.topic}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{area.topic}</p>
                    <p className="text-xs text-slate-400">
                      {area.correct} / {area.total} correct
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{area.accuracy}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800/90 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Weak Areas (&lt;60% Accuracy)</span>
          </div>

          {weakAreas.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              🎉 Outstanding! No weak areas detected in this quiz attempt.
            </div>
          ) : (
            <div className="space-y-3">
              {weakAreas.map((area) => (
                <div
                  key={area.topic}
                  className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{area.topic}</p>
                    <p className="text-xs text-slate-400">
                      {area.correct} / {area.total} correct
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-400">{area.accuracy}%</span>
                    <Link
                      to={`/app/quiz/attempt/${attemptId}/revise/${encodeURIComponent(area.topic)}`}
                      className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-bold rounded-lg transition"
                    >
                      Revise
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Incorrect Answers & Explanations */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl backdrop-blur-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Review & Explanations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Understanding why your answer was incorrect is the fastest way to master difficult topics.
          </p>
        </div>

        {incorrectAnswers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-300">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="font-bold text-sm">Perfect Score!</p>
            <p className="text-xs mt-1 text-slate-400">You answered every single question correctly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {incorrectAnswers.map((ans, idx) => (
              <div
                key={ans.questionId}
                className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
                    Incorrect • Question #{idx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-400">Topic: {ans.topic}</span>
                </div>

                <p className="text-base font-bold text-white">{ans.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="font-bold text-rose-400 mb-1">Your Answer:</p>
                    <p className="text-rose-200">{ans.selectedAnswer || "No Answer"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="font-bold text-emerald-400 mb-1">Correct Answer:</p>
                    <p className="text-emerald-200 font-semibold">{ans.correctAnswer}</p>
                  </div>
                </div>

                {/* Pedagogical Explanation */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Why Your Answer Is Incorrect:</span>
                  </p>
                  <p>{ans.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
