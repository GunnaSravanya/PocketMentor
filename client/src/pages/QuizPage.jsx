import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuizStore } from "../store/quizStore";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Loader2,
  HelpCircle,
} from "lucide-react";

export const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { fetchQuiz, submitQuiz, activeQuiz, loading, submitting } = useQuizStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOption }
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
    }
  }, [quizId, fetchQuiz]);

  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question reached - prompt review & submission
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k] && selectedAnswers[k].trim().length > 0
  ).length;

  const handleSubmit = async () => {
    setSubmitError("");
    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: selectedAnswers[q._id] || "",
    }));

    const result = await submitQuiz(quizId, formattedAnswers);
    if (result.success && result.data?.attemptId) {
      navigate(`/app/quiz/attempt/${result.data.attemptId}`);
    } else {
      setSubmitError(result.message || "Failed to submit quiz");
      setShowConfirmModal(false);
    }
  };

  if (loading || !activeQuiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/70 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading your AI quiz session...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 max-w-xl mx-auto backdrop-blur-sm">
        <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Quiz not available</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">No questions found in this quiz generation.</p>
        <Link
          to="/app"
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-md"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & meta */}
      <div className="flex items-center justify-between">
        <Link
          to={`/app/notes/${activeQuiz.noteId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          Generation #{activeQuiz.generationNumber}
        </span>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Quiz Box */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-brand-600/10 blur-3xl pointer-events-none"></div>

        {/* Progress & Topic */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30 shadow-inner">
                Topic: {currentQuestion.topic}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400">
              Answered {answeredCount} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="relative z-10 flex gap-1.5 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q._id]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all flex-1 min-w-[18px] ${
                  isCurrent
                    ? "bg-cyan-400 scale-y-125 shadow-sm shadow-cyan-400/50"
                    : isAnswered
                    ? "bg-emerald-400"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Question Text */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            {currentQuestion.question}
          </h2>
        </div>

        {/* 4 MCQ Options */}
        <div className="relative z-10 space-y-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion._id] === option;
            const optionLetters = ["A", "B", "C", "D"];

            return (
              <label
                key={idx}
                onClick={() => handleSelectOption(option)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition select-none ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    : "border-slate-800/90 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition flex-shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-brand-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {optionLetters[idx] || idx + 1}
                </div>

                <span
                  className={`text-sm sm:text-base flex-1 ${
                    isSelected ? "text-white font-bold" : "text-slate-300 font-medium"
                  }`}
                >
                  {option}
                </span>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition flex-shrink-0 ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950"></div>}
                </div>
              </label>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="py-2.5 px-6 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-brand-500/25"
            >
              <span>Review & Submit</span>
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal to Prevent Accidental Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-4 mx-auto shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white text-center">Ready to submit?</h3>

            <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Total Questions:</span>
                <span className="text-white font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Answered:</span>
                <span className="text-emerald-400 font-bold">{answeredCount}</span>
              </div>
              {questions.length - answeredCount > 0 && (
                <div className="flex justify-between font-medium text-rose-400">
                  <span>Unanswered:</span>
                  <span className="font-bold">{questions.length - answeredCount}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Keep Reviewing
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <span>Submit Quiz</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
