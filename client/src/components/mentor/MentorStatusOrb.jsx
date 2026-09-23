import React from "react";
import { useMentorStore, MENTOR_STATES } from "../../store/mentorStore";
import { Sparkles, Bot } from "lucide-react";

export const MentorStatusOrb = ({ showLabel = true, className = "" }) => {
  const { currentState, statusMessage, isLivingMentorEnabled, setMentorSpaceOpen } = useMentorStore();

  if (!isLivingMentorEnabled) return null;

  const getStatusColor = () => {
    switch (currentState) {
      case MENTOR_STATES.SCANNING:
      case MENTOR_STATES.ANALYZING:
        return "bg-purple-500 text-purple-300 border-purple-500/40 shadow-purple-500/30";
      case MENTOR_STATES.THINKING:
        return "bg-cyan-500 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30";
      case MENTOR_STATES.EXPLAINING:
        return "bg-indigo-500 text-indigo-300 border-indigo-500/40 shadow-indigo-500/30";
      case MENTOR_STATES.SUCCESS:
      case MENTOR_STATES.CELEBRATING:
        return "bg-emerald-500 text-emerald-300 border-emerald-500/40 shadow-emerald-500/30";
      case MENTOR_STATES.REVISING:
      case MENTOR_STATES.FOCUSED:
        return "bg-amber-500 text-amber-300 border-amber-500/40 shadow-amber-500/30";
      case MENTOR_STATES.WARNING:
        return "bg-rose-500 text-rose-300 border-rose-500/40 shadow-rose-500/30";
      default:
        return "bg-cyan-500 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30";
    }
  };

  const statusColorClass = getStatusColor();

  return (
    <button
      onClick={() => setMentorSpaceOpen(true)}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs transition-all shadow-sm ${className}`}
      title={`Mentor State: ${currentState} — ${statusMessage}. Click to open Study Space.`}
    >
      {/* Outer Pulse Ring */}
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            statusColorClass.split(" ")[0]
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            statusColorClass.split(" ")[0]
          }`}
        />
      </span>

      <span className="font-mono text-[11px] font-bold tracking-wider text-slate-300 group-hover:text-white uppercase transition">
        Mentor • <span className="text-cyan-400">{currentState}</span>
      </span>

      <Bot className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition ml-0.5" />
    </button>
  );
};

export default MentorStatusOrb;
