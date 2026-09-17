import { useState } from "react";
import { User, Bot, Copy, Check } from "lucide-react";

export const MessageBubble = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`group flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } animate-in fade-in duration-200`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm ${
          isUser
            ? "bg-slate-800 text-slate-200 border border-slate-700"
            : "bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white shadow-cyan-500/20"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-tr-none shadow-md shadow-brand-500/10 font-medium"
            : "bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800/90 shadow-xl backdrop-blur-sm"
        }`}
      >
        {/* Assistant Header / Copy Button */}
        {!isUser && (
          <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-800/60 text-xs text-slate-400">
            <span className="font-semibold text-cyan-400 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Pocket Mentor
            </span>

            <button
              onClick={handleCopy}
              className="p-1 hover:text-white rounded-md transition text-slate-400 opacity-60 group-hover:opacity-100 flex items-center gap-1 text-[11px]"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words leading-relaxed selection:bg-cyan-500/30 selection:text-white">
          {message.content}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <div
            className={`text-[10px] mt-2 text-right font-medium select-none ${
              isUser ? "text-cyan-100/70" : "text-slate-500"
            }`}
          >
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
