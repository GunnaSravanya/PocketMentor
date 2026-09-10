import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useNoteStore } from "../store/noteStore";
import { useQuizStore } from "../store/quizStore";
import {
  ArrowLeft,
  Volume2,
  Layers,
  BrainCircuit,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Bot,
} from "lucide-react";

export const NoteDetailsPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { fetchNoteById, deleteNote, activeNote, activeNoteDetails, loading } = useNoteStore();
  const { getOrCreateQuizForNote, generateNewQuizForNote, loading: quizLoading } = useQuizStore();

  const [showRawText, setShowRawText] = useState(false);
  const [actionLoading, setActionLoading] = useState(""); // "summary" | "flashcards" | "quiz"

  useEffect(() => {
    if (noteId) {
      fetchNoteById(noteId);
    }
  }, [noteId, fetchNoteById]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this study note and all generated materials?")) {
      await deleteNote(noteId);
      navigate("/app");
    }
  };

  const handleTakeQuiz = async () => {
    setActionLoading("quiz");
    const quiz = await getOrCreateQuizForNote(noteId);
    setActionLoading("");
    if (quiz?._id) {
      navigate(`/app/quiz/${quiz._id}`);
    }
  };

  const handleGenerateNewQuiz = async () => {
    setActionLoading("newQuiz");
    const quiz = await generateNewQuizForNote(noteId);
    setActionLoading("");
    if (quiz?._id) {
      navigate(`/app/quiz/${quiz._id}`);
    }
  };

  if (loading || !activeNote) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading note details...</p>
      </div>
    );
  }

  const hasSummary = Boolean(activeNoteDetails?.summary);
  const hasFlashcards = (activeNoteDetails?.flashcardsCount || 0) > 0;
  const quizzes = activeNoteDetails?.quizzes || [];
  const latestQuiz = quizzes[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button & top actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/app/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-xl transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI Tutor</span>
          </Link>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Note</span>
          </button>
        </div>
      </div>

      {/* Note Header Card */}
      <div className="bg-slate-900/80 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeNote.sourceType === "file"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
              }`}
            >
              {activeNote.sourceType === "file" ? "PDF Document" : "Pasted Notes"}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Uploaded {new Date(activeNote.createdAt).toLocaleDateString()}</span>
            </span>

            {activeNote.extractedText && (
              <span className="text-xs text-slate-500">
                • {activeNote.extractedText.length.toLocaleString()} characters indexed
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeNote.title}
          </h1>
        </div>

        {/* Note Revision Progress Bar */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Note Revision Progress</span>
            </span>
            <span
              className={`font-black text-sm ${
                (activeNoteDetails?.progress || 0) >= 75
                  ? "text-emerald-400"
                  : (activeNoteDetails?.progress || 0) >= 50
                  ? "text-cyan-400"
                  : "text-amber-400"
              }`}
            >
              {activeNoteDetails?.progress || 0}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (activeNoteDetails?.progress || 0) >= 75
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                  : (activeNoteDetails?.progress || 0) >= 50
                  ? "bg-gradient-to-r from-brand-500 to-cyan-400"
                  : "bg-gradient-to-r from-amber-500 to-cyan-500"
              }`}
              style={{ width: `${Math.max(activeNoteDetails?.progress || 0, 5)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-semibold text-slate-400">
            <div className={`flex items-center gap-1.5 ${hasSummary ? "text-cyan-400 font-bold" : ""}`}>
              <span>{hasSummary ? "✓" : "○"}</span>
              <span>1. 60s Summary</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasFlashcards ? "text-emerald-400 font-bold" : ""}`}>
              <span>{hasFlashcards ? "✓" : "○"}</span>
              <span>2. Flashcards</span>
            </div>
            <div className={`flex items-center gap-1.5 ${quizzes.length > 0 ? "text-amber-400 font-bold" : ""}`}>
              <span>{quizzes.length > 0 ? "✓" : "○"}</span>
              <span>3. AI Quiz</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                (activeNoteDetails?.attemptsCount || 0) > 0 ? "text-purple-400 font-bold" : ""
              }`}
            >
              <span>{(activeNoteDetails?.attemptsCount || 0) > 0 ? "✓" : "○"}</span>
              <span>4. Graded ({activeNoteDetails?.attemptsCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Collapsible raw text view */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{showRawText ? "Hide Extracted Notes" : "View Extracted Notes Preview"}</span>
            {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRawText && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
              {activeNote.extractedText}
            </div>
          )}
        </div>
      </div>

      {/* 3 AI Revision Cards */}
      <div>
        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>AI Revision Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 60-Second Audio Summary */}
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Volume2 className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-lg">60s Summary</h3>
                {hasSummary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                High-yield conceptual synopsis designed for a 60-second read with built-in voice narration.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to={`/app/notes/${noteId}/summary`}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>{hasSummary ? "View & Listen" : "Generate Summary"}</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Interactive Flashcards */}
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Layers className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-lg">Flashcards</h3>
                {hasFlashcards && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {activeNoteDetails.flashcardsCount} Cards
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Active recall flashcards covering key definitions, formulas, and conceptual differences.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to={`/app/notes/${noteId}/flashcards`}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Layers className="w-4 h-4" />
                <span>{hasFlashcards ? "Study Flashcards" : "Generate Flashcards"}</span>
              </Link>
            </div>
          </div>

          {/* Card 3: AI MCQ Quiz */}
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <BrainCircuit className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-lg">AI MCQ Quiz</h3>
                {quizzes.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    Gen #{latestQuiz.generationNumber}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Topic-tagged diagnostic quiz that scores your performance and pinpoints weak areas.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={handleTakeQuiz}
                disabled={actionLoading === "quiz"}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
              >
                {actionLoading === "quiz" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Quiz...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>
                      {quizzes.length > 0 ? `Take Quiz (Gen #${latestQuiz.generationNumber})` : "Generate Quiz"}
                    </span>
                  </>
                )}
              </button>

              {quizzes.length > 0 && (
                <button
                  onClick={handleGenerateNewQuiz}
                  disabled={actionLoading === "newQuiz"}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition disabled:opacity-60"
                >
                  {actionLoading === "newQuiz" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <PlusCircle className="w-3 h-3 text-amber-400" />
                  )}
                  <span>Generate New Quiz (Gen #{latestQuiz.generationNumber + 1})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailsPage;
