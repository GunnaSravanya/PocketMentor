import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mentorService, noteService } from "../services/api";
import {
  ArrowLeft,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export const FlashcardsPage = () => {
  const { noteId } = useParams();
  const [cards, setCards] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);
        setError("");
        const [noteRes, flashcardRes] = await Promise.all([
          noteService.getNoteById(noteId),
          mentorService.getFlashcards(noteId),
        ]);

        if (noteRes.data.success) {
          setNoteTitle(noteRes.data.data.note.title);
        }

        if (flashcardRes.data.success && flashcardRes.data.data.flashcardSet) {
          setCards(flashcardRes.data.data.flashcardSet.cards || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [noteId]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError("");
      setIsFlipped(false);
      const res = await mentorService.getFlashcards(noteId, true);
      if (res.data.success) {
        setCards(res.data.data.flashcardSet.cards || []);
        setCurrentIndex(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to regenerate flashcards");
    } finally {
      setRegenerating(false);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={`/app/notes/${noteId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Note Overview</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Synthesizing AI active recall flashcards...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-300">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={handleRegenerate}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            Try Again
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-lg">No flashcards found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Click below to generate revision flashcards from your notes.</p>
          <button
            onClick={handleRegenerate}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition"
          >
            Generate Flashcards Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Recall Deck • {noteTitle}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Card {currentIndex + 1} of {cards.length}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold border border-slate-800"
                title="Shuffle Cards"
              >
                <Shuffle className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold border border-slate-800 disabled:opacity-60"
                title="Regenerate Flashcards"
              >
                {regenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                )}
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>

          {/* Flashcard Area (Interactive Reveal / Flip) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`cursor-pointer min-h-[340px] rounded-3xl p-8 sm:p-12 transition-all duration-300 flex flex-col justify-between select-none shadow-2xl backdrop-blur-sm border relative overflow-hidden ${
              isFlipped
                ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-brand-950 text-white border-brand-500/50 ring-1 ring-brand-500/20"
                : "bg-slate-900/90 text-white border-slate-800 hover:border-cyan-500/40 hover:shadow-cyan-500/10"
            }`}
          >
            {/* Subtle corner decorative glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl pointer-events-none rounded-full ${
              isFlipped ? "bg-emerald-500/10" : "bg-cyan-500/10"
            }`}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-inner ${
                    isFlipped
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                      : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                  }`}
                >
                  {isFlipped ? "Answer" : "Question"}
                </span>

                <span className={`text-xs flex items-center gap-1.5 font-medium ${
                  isFlipped ? "text-emerald-300" : "text-slate-400"
                }`}>
                  {isFlipped ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isFlipped ? "Click to view question" : "Click to flip and reveal answer"}</span>
                </span>
              </div>

              <div className="py-4">
                <p
                  className={`text-xl sm:text-2xl font-bold leading-relaxed tracking-tight ${
                    isFlipped ? "text-slate-100" : "text-slate-200"
                  }`}
                >
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className={isFlipped ? "text-emerald-400/80" : "text-slate-500"}>
                Tip: Click anywhere or press space to flip
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-md ${
                isFlipped ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-300"
              }`}>
                {isFlipped ? "Answer Visible" : "Card Concealed"}
              </span>
            </div>
          </div>

          {/* Card Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="py-3 px-6 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
            >
              {isFlipped ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isFlipped ? "Show Question" : "Reveal Answer"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-brand-500/20"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
