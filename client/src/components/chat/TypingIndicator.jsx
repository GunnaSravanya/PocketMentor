import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Pocket Mentor is thinking...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
