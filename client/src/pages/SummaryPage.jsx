import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mentorService, noteService } from "../services/api";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import {
  ArrowLeft,
  Volume2,
  Pause,
  Play,
  Square,
  RotateCcw,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const SummaryPage = () => {
  const { noteId } = useParams();
  const [summary, setSummary] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const { supported, isPlaying, isPaused, speak, pause, resume, stop } =
    useSpeechSynthesis();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [noteRes, summaryRes] = await Promise.all([
          noteService.getNoteById(noteId),
          mentorService.getSummary(noteId),
        ]);

        if (noteRes.data.success) {
          setNoteTitle(noteRes.data.data.note.title);
        }

        if (summaryRes.data.success && summaryRes.data.data.summary) {
          setSummary(summaryRes.data.data.summary.content);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      stop();
    };
  }, [noteId]);

  const handleRegenerate = async () => {
    try {
      stop();
      setRegenerating(true);
      setError("");
      const res = await mentorService.getSummary(noteId, true);
      if (res.data.success) {
        setSummary(res.data.data.summary.content);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to regenerate summary");
    } finally {
      setRegenerating(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!summary) return;

    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(summary);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <p className="text-xs text-slate-400">Generating 60-second AI synopsis...</p>
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
      ) : (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Top Banner with Audio Controls */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white border-b border-slate-800 relative">
            <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur mb-2 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  60-Second AI Synopsis
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {noteTitle || "Study Notes Summary"}
                </h1>
              </div>

              {/* Voice Player Controls */}
              {supported && (
                <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur p-1.5 rounded-2xl border border-slate-800/80 shadow-lg">
                  <button
                    onClick={handleVoiceToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition"
                  >
                    {isPlaying && !isPaused ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Speech</span>
                      </>
                    ) : isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Listen (60s Voice)</span>
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <button
                      onClick={stop}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Stop Speaking"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Speaking Status indicator */}
            {isPlaying && (
              <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-cyan-300 animate-pulse font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{isPaused ? "Audio paused" : "Reading summary aloud using SpeechSynthesis..."}</span>
              </div>
            )}
          </div>

          {/* Formatted Content */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="max-w-none text-slate-200 text-base sm:text-lg leading-relaxed font-normal whitespace-pre-line bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60">
              {summary}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition disabled:opacity-60"
              >
                {regenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>Regenerate Summary with AI</span>
              </button>

              <div className="flex items-center gap-3">
                <Link
                  to={`/app/notes/${noteId}/flashcards`}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Go to Flashcards</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
