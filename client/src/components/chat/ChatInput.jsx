import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, BookOpen } from "lucide-react";

export const ChatInput = ({ onSendMessage, isSending, selectedNoteId, onNoteChange, notes = [] }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isSending) {
      textareaRef.current?.focus();
    }
  }, [isSending]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed);
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-expand textarea up to 160px
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800/90 backdrop-blur-md">
      {/* Optional Note Context Bar */}
      <div className="flex items-center justify-between gap-3 mb-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold">Study Note Context:</span>
          <select
            value={selectedNoteId || ""}
            onChange={(e) => onNoteChange && onNoteChange(e.target.value || null)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 max-w-[220px] truncate"
          >
            <option value="">General Study (No Note)</option>
            {notes.map((note) => (
              <option key={note._id} value={note._id}>
                {note.title}
              </option>
            ))}
          </select>
        </div>

        <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">Enter ↵</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">Shift+Enter</kbd> for new line
        </span>
      </div>

      {/* Input Row */}
      <div className="relative flex items-end gap-2 bg-slate-950/80 border border-slate-800 focus-within:border-cyan-500/60 rounded-2xl p-1.5 transition shadow-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask your Pocket Mentor any study question, clarify a concept, or ask for examples..."
          disabled={isSending}
          className="flex-1 max-h-40 min-h-[44px] bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-3 py-2.5 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isSending}
          className="p-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold rounded-xl transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 flex-shrink-0"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
