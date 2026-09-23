import React from "react";
import { useMentorStore } from "../../store/mentorStore";
import { BrainCircuit, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export const KnowledgePulse = ({ className = "" }) => {
  const { context } = useMentorStore();
  const { topicMastery, weakTopics, activeSubject } = context;

  const displayTopics = topicMastery && topicMastery.length > 0
    ? topicMastery
    : (weakTopics && weakTopics.length > 0
        ? weakTopics.map((t) => ({ topic: t, accuracy: 45, mastered: false }))
        : null);

  if (!displayTopics) {
    return (
      <div className={`p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500 ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-1.5 text-cyan-400 font-semibold">
          <BrainCircuit className="w-4 h-4 animate-pulse" />
          <span>Knowledge Pulse</span>
        </div>
        <p>Complete a quiz or flashcard set to synchronize your real-time concept map.</p>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">
            Knowledge Pulse {activeSubject ? `• ${activeSubject}` : ""}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
          Synchronized
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayTopics.slice(0, 8).map((t) => (
          <div
            key={t.topic}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
              t.mastered
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {t.mastered ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{t.topic}</span>
            <span className="font-mono text-[10px] opacity-80">({t.accuracy}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgePulse;
