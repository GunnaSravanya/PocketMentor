import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import {
  Bot,
  Sparkles,
  BookOpen,
  Trash2,
  AlertCircle,
  Menu,
  Lightbulb,
  Loader2,
} from "lucide-react";

export const ChatWindow = ({
  messages = [],
  isSending = false,
  isLoading = false,
  error = null,
  currentConversation,
  selectedNoteTitle,
  onClearChat,
  onToggleSidebar,
  onSampleQuestionClick,
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const samplePrompts = [
    "Explain Banker's Algorithm with an example",
    "What is the difference between paging and segmentation?",
    "Give me 3 active recall questions on my material",
    "How do I prevent deadlocks in operating systems?",
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden relative">
      {/* Top Window Header */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-3 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Toggle conversations sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/15">
            <Bot className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {currentConversation?.title || "AI Study Mentor"}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Active Recall Tutor
              </span>
            </div>

            {selectedNoteTitle ? (
              <p className="text-[11px] text-indigo-300 flex items-center gap-1 truncate mt-0.5">
                <BookOpen className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span>Grounded in: {selectedNoteTitle}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">
                General Academic & Conceptual Mastery
              </p>
            )}
          </div>
        </div>

        {/* Clear chat action */}
        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition text-xs flex items-center gap-1.5"
            title="Clear current view"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="m-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 py-8 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                How can I assist your revision today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Ask doubts, test your comprehension, request step-by-step proofs, or explore concepts directly from your uploaded study notes.
              </p>
            </div>

            {/* Suggested Starter Prompts */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1.5 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Try asking:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSampleQuestionClick && onSampleQuestionClick(prompt)}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-xs font-medium text-slate-300 hover:text-white transition shadow-sm"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render Messages */
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isSending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
