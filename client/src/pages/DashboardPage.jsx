import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useNoteStore } from "../store/noteStore";
import { useQuizStore } from "../store/quizStore";
import {
  BookOpen,
  PlusCircle,
  BrainCircuit,
  Percent,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Layers,
  Volume2,
  Trash2,
  Sparkles,
  Bot,
} from "lucide-react";
import { useMentorStore } from "../store/mentorStore";
import { MentorStatusOrb } from "../components/mentor/MentorStatusOrb";
import { KnowledgePulse } from "../components/mentor/KnowledgePulse";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { notes, fetchNotes, deleteNote, loading: notesLoading } = useNoteStore();
  const { stats, fetchStats } = useQuizStore();
  const { setMentorSpaceOpen } = useMentorStore();

  useEffect(() => {
    fetchNotes();
    fetchStats();
  }, [fetchNotes, fetchStats]);

  const handleDeleteNote = async (e, noteId, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? All associated summaries, flashcards, and quizzes will be deleted.`
      )
    ) {
      await deleteNote(noteId);
      fetchStats();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800/90 text-white shadow-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Study Workspace
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user?.Fname || "Student"}! 👋
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Transform messy lecture notes into 60-second audio summaries, active flashcards, and diagnostic AI quizzes.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <MentorStatusOrb />

          <button
            onClick={() => setMentorSpaceOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold rounded-2xl transition flex items-center gap-2 text-xs shadow-sm hover:scale-[1.02]"
            title="Open immersive Living AI Mentor Workspace"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Study with Mentor</span>
          </button>

          <Link
            to="/app/chat"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl transition flex items-center gap-2 text-xs"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Chat</span>
          </Link>

          <Link
            to="/app/upload"
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:scale-[1.02] text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/15 transition flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Notes</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/90 shadow-sm flex items-center gap-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Notes</p>
            <p className="text-2xl font-black text-white">{stats?.notesCount ?? notes.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/90 shadow-sm flex items-center gap-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quizzes Taken</p>
            <p className="text-2xl font-black text-white">{stats?.totalQuizzesTaken ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/90 shadow-sm flex items-center gap-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Score</p>
            <p className="text-2xl font-black text-white">
              {stats?.averageScore ? `${stats.averageScore}%` : "—"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800/90 shadow-sm flex items-center gap-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weak Areas</p>
            <p className="text-2xl font-black text-white">{stats?.weakAreasCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Weak Areas Banner if detected */}
      {stats?.weakAreas && stats.weakAreas.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                Topics Requiring Attention (&lt;60% accuracy)
              </h3>
            </div>
            <Link
              to="/app/history"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.weakAreas.slice(0, 6).map((item) => (
              <span
                key={item.topic}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {item.topic} ({item.latestAccuracy}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Synchronized Knowledge Pulse Concept Map */}
      <KnowledgePulse />

      {/* Recent Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Your Study Notes</span>
          </h2>
          <Link
            to="/app/upload"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>+ Add Note</span>
          </Link>
        </div>

        {notesLoading ? (
          <div className="text-center py-12 text-slate-500">Loading your notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/60 rounded-3xl border border-dashed border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No study notes yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Upload a PDF lecture or paste your rough notes to generate audio summaries, flashcards, and quizzes.
            </p>
            <Link
              to="/app/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Notes Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <Link
                key={note._id}
                to={`/app/notes/${note._id}`}
                className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800/90 shadow-sm hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        note.sourceType === "file"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {note.sourceType === "file" ? "PDF Document" : "Pasted Notes"}
                    </span>

                    <button
                      onClick={(e) => handleDeleteNote(e, note._id, note.title)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition line-clamp-2">
                    {note.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    {note.bestScore !== null && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Best: {note.bestScore}%
                      </span>
                    )}
                  </div>

                  {/* Progress Bar per Particular Note */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">Revision Progress</span>
                      <span
                        className={`font-black ${
                          (note.progress || 0) >= 75
                            ? "text-emerald-400"
                            : (note.progress || 0) >= 50
                            ? "text-cyan-400"
                            : "text-amber-400"
                        }`}
                      >
                        {note.progress || 0}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (note.progress || 0) >= 75
                            ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                            : (note.progress || 0) >= 50
                            ? "bg-gradient-to-r from-brand-500 to-cyan-400"
                            : "bg-gradient-to-r from-amber-500 to-cyan-500"
                        }`}
                        style={{ width: `${Math.max(note.progress || 0, 5)}%` }}
                      ></div>
                    </div>

                    {/* Progress step indicators */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                      <span className={note.hasSummary ? "text-cyan-400 font-bold" : ""}>
                        {note.hasSummary ? "✓" : "○"} Summary
                      </span>
                      <span className={note.hasFlashcards ? "text-emerald-400 font-bold" : ""}>
                        {note.hasFlashcards ? "✓" : "○"} Cards
                      </span>
                      <span className={note.quizCount > 0 ? "text-amber-400 font-bold" : ""}>
                        {note.quizCount > 0 ? "✓" : "○"} Quiz
                      </span>
                      <span className={note.attemptsCount > 0 ? "text-purple-400 font-bold" : ""}>
                        {note.attemptsCount > 0 ? "✓" : "○"} Graded
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {note.hasSummary && (
                      <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400" title="Summary ready">
                        <Volume2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {note.hasFlashcards && (
                      <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400" title="Flashcards ready">
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {note.quizCount > 0 && (
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-400" title="Quizzes available">
                        <BrainCircuit className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition flex items-center gap-1">
                    <span>Study Note</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
