import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuizStore } from "../store/quizStore";
import {
  History,
  BrainCircuit,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";

export const QuizHistoryPage = () => {
  const { history, fetchHistory, loading } = useQuizStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Study Progression
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quiz History & Mastery Records</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your previous attempts, track score improvements over time, and revisit mistake explanations.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading your quiz history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-lg">No quizzes attempted yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Upload notes and take an AI-generated quiz to track your progress and uncover weak areas.
          </p>
          <Link
            to="/app/upload"
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/25 transition"
          >
            Upload Study Notes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((attempt) => {
            const isHigh = attempt.percentage >= 70;
            const isMedium = attempt.percentage >= 50 && attempt.percentage < 70;

            return (
              <Link
                key={attempt._id}
                to={`/app/quiz/attempt/${attempt._id}`}
                className="block bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-xl hover:border-cyan-500/40 hover:shadow-cyan-500/10 backdrop-blur-sm transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Gen #{attempt.generationNumber || 1}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(attempt.createdAt).toLocaleDateString()} at{" "}
                        {new Date(attempt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="font-black text-white text-lg group-hover:text-cyan-400 transition">
                      {attempt.noteTitle}
                    </h3>

                    {attempt.weakAreas && attempt.weakAreas.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Weak Areas:
                        </span>
                        {attempt.weakAreas.map((w) => (
                          <span
                            key={w.topic}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          >
                            {w.topic} ({w.accuracy}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 pt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>All tested topics passed with ≥60% accuracy</span>
                      </div>
                    )}
                  </div>

                  {/* Score badge & View Results Arrow */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        {attempt.score} <span className="text-slate-600 font-light text-base">/ {attempt.totalQuestions}</span>
                      </div>
                      <span
                        className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border ${
                          isHigh
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : isMedium
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {attempt.percentage}% Mastery
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 text-slate-400 flex items-center justify-center transition flex-shrink-0 border border-slate-700">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
