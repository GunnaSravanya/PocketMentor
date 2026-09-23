import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mentorService } from "../services/api";
import { mentorEvents } from "../services/mentorEvents";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  ChevronRight,
  Bot,
} from "lucide-react";

export const ReviseTopicPage = () => {
  const { attemptId, topic } = useParams();
  const [revision, setRevision] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mini practice question state
  const [selectedPracticeOption, setSelectedPracticeOption] = useState("");
  const [submittedPractice, setSubmittedPractice] = useState(false);

  useEffect(() => {
    const loadRevision = async () => {
      try {
        setLoading(true);
        setError("");
        mentorEvents.revisionStarted(decodeURIComponent(topic));
        const res = await mentorService.reviseTopic(attemptId, topic);
        if (res.data.success) {
          setRevision(res.data.data.revision);
          setNoteTitle(res.data.data.noteTitle);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load topic revision");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId && topic) {
      loadRevision();
    }
  }, [attemptId, topic]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">
          Synthesizing targeted revision module for "{decodeURIComponent(topic)}"...
        </p>
      </div>
    );
  }

  if (error || !revision) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-300 text-center">
        <p className="font-semibold text-sm">{error || "Unable to generate revision for this topic"}</p>
        <Link
          to={`/app/quiz/attempt/${attemptId}`}
          className="mt-4 inline-block px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md"
        >
          Back to Quiz Results
        </Link>
      </div>
    );
  }

  const { quickExplanation, importantConcepts, relatedFlashcards, practiceQuestion } = revision;

  const isPracticeCorrect =
    practiceQuestion &&
    selectedPracticeOption.trim().toLowerCase() === practiceQuestion.correctAnswer.trim().toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/app/quiz/attempt/${attemptId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quiz Results</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-rose-500/30 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-80 h-40 bg-rose-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur mb-3 shadow-inner">
            <AlertTriangle className="w-3.5 h-3.5" />
            Targeted Weak Area Revision
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {decodeURIComponent(topic)}
          </h1>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm">
            Source: {noteTitle || "Study Notes"} • Re-grounding core principles directly from your notes
          </p>
        </div>
      </div>

      {/* 1. Quick Explanation */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl backdrop-blur-sm space-y-3">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Quick Concept Explanation</span>
        </h2>
        <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          {quickExplanation}
        </p>
      </div>

      {/* 2. Important Concepts */}
      {importantConcepts && importantConcepts.length > 0 && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Important Concepts & Takeaways</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {importantConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{concept}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Related Flashcards */}
      {relatedFlashcards && relatedFlashcards.length > 0 && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-xl backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Topic Flashcards</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedFlashcards.map((card, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Question #{idx + 1}
                  </span>
                  <p className="font-bold text-white text-sm mt-2">{card.question}</p>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 font-bold block mb-0.5">Answer:</strong>
                    {card.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Mini Practice Question */}
      {practiceQuestion && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>Mini Practice: Check Your Retention</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Immediate Feedback
            </span>
          </div>

          <p className="text-base font-bold text-white">{practiceQuestion.question}</p>

          <div className="space-y-2.5">
            {practiceQuestion.options.map((option, idx) => {
              const isSelected = selectedPracticeOption === option;
              let optionStyle = "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300";

              if (submittedPractice) {
                if (option.trim().toLowerCase() === practiceQuestion.correctAnswer.trim().toLowerCase()) {
                  optionStyle = "border-emerald-500 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/30";
                } else if (isSelected) {
                  optionStyle = "border-rose-500 bg-rose-950/30 text-rose-200";
                }
              } else if (isSelected) {
                optionStyle = "border-cyan-500 bg-cyan-950/30 text-white ring-1 ring-cyan-500/40";
              }

              return (
                <label
                  key={idx}
                  onClick={() => !submittedPractice && setSelectedPracticeOption(option)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-sm font-medium transition ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                    {["A", "B", "C", "D"][idx] || idx + 1}
                  </span>
                  <span className="flex-1">{option}</span>
                </label>
              );
            })}
          </div>

          {!submittedPractice ? (
            <button
              onClick={() => selectedPracticeOption && setSubmittedPractice(true)}
              disabled={!selectedPracticeOption}
              className="py-2.5 px-5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              Check Answer
            </button>
          ) : (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isPracticeCorrect
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-200"
              }`}
            >
              <p className="font-bold flex items-center gap-1.5 text-sm">
                {isPracticeCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Correct! You mastered this point.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300">Review: The correct answer is "{practiceQuestion.correctAnswer}".</span>
                  </>
                )}
              </p>
              <p className="text-slate-300">{practiceQuestion.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Return to Quiz Action */}
      <div className="pt-4 flex justify-end">
        <Link
          to={`/app/quiz/attempt/${attemptId}`}
          className="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
        >
          <span>Return to Quiz Results</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
