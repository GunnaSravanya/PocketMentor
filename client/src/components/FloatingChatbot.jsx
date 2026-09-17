import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNoteStore } from "../store/noteStore";
import { mentorService } from "../services/api";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  ChevronDown,
  BookOpen,
  Loader2,
  Minimize2,
  Maximize2,
} from "lucide-react";

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **Pocket Mentor AI Tutor**. Ask me any doubt, request a concept explanation, or get practice questions based on your notes!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [useCurrentNoteContext, setUseCurrentNoteContext] = useState(true);
  const [floatingConversationId, setFloatingConversationId] = useState(null);

  const { activeNote } = useNoteStore();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || loading) return;

    const userMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const payload = {
        message: textToSend,
        conversationId: floatingConversationId || undefined,
        noteId: useCurrentNoteContext && activeNote?._id ? activeNote._id : null,
      };

      const res = await mentorService.chat(payload);
      if (res.data?.data?.conversationId) {
        setFloatingConversationId(res.data.data.conversationId);
      }

      const replyText =
        res.data?.data?.reply ||
        "I've processed your question. Make sure to review the core formulas and definitions in your notes!";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "I'm having trouble connecting to the AI right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setFloatingConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. What academic topic would you like to explore next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const quickPrompts = [
    "Explain this concept simply",
    "What are common exam questions?",
    "Summarize the key conditions",
    "Give me a real-world example",
  ];

  return (
    <aside aria-label="Pocket Mentor AI Tutor Chatbot" className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-105 transition-all duration-300"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-brand-700 animate-pulse"></span>
          </div>
          <span>Ask AI Mentor</span>
          <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "w-[92vw] sm:w-[540px] h-[80vh] max-h-[700px]"
              : "w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-cyan-300 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white leading-none">Pocket Mentor AI</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    Grok Powered
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-300 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Online & Ready to Help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-white/10 rounded-xl transition text-slate-300 hover:text-white"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition text-slate-300 hover:text-white hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition text-slate-300 hover:text-white"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          {activeNote && (
            <div className="px-3.5 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                <BookOpen className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="font-medium truncate">Note: {activeNote.title}</span>
              </div>
              <button
                onClick={() => setUseCurrentNoteContext(!useCurrentNoteContext)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                  useCurrentNoteContext
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {useCurrentNoteContext ? "Active Context ON" : "General Mode"}
              </button>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-sm">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isUser
                        ? "bg-slate-800 text-white"
                        : "bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-sm"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                      isUser
                        ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/10 text-xs sm:text-sm"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-sm text-xs sm:text-sm whitespace-pre-wrap"
                    }`}
                  >
                    {msg.content}
                    <div
                      className={`text-[9px] mt-1.5 text-right font-medium ${
                        isUser ? "text-brand-200" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                  <span>Pocket Mentor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition flex-shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any academic doubt or revision question..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 transition"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-40 shadow-sm flex-shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default FloatingChatbot;
