import { useState, useEffect, useRef } from "react";
import { useNoteStore } from "../store/noteStore";
import { mentorService } from "../services/api";
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  Trash2,
  Loader2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to your **Pocket Mentor AI Study Room**! 🎓\n\nI can help you understand complex concepts, clarify tricky definitions, explain formulas step-by-step, or generate mock practice problems from your notes.\n\nSelect a note from the dropdown if you'd like me to ground answers in your uploaded materials, or ask me any general question!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState("");

  const { notes, fetchNotes } = useNoteStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text = null) => {
    const textToSend = (text || inputValue).trim();
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
      const res = await mentorService.chat({
        message: textToSend,
        conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        noteId: selectedNoteId || null,
      });

      const reply = res.data?.data?.reply || "I've analyzed your question. Review the key points in your study material!";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had a brief issue connecting with Grok AI. Please try asking again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Explain Banker's Algorithm with an example",
    "What is the difference between paging and segmentation?",
    "Give me 3 active recall questions on my notes",
    "How can I memorize complex definitions quickly?",
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-700 via-indigo-700 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-cyan-300 shadow-inner">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-white">AI Study Mentor Chat</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Grok AI
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Ask questions, test comprehension, or clarify difficult concepts in real time.
            </p>
          </div>
        </div>

        {/* Note selector filter */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-300 hidden sm:block" />
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white focus:outline-none focus:bg-slate-800"
          >
            <option value="" className="bg-slate-900 text-white">
              General Academic Context
            </option>
            {notes.map((note) => (
              <option key={note._id} value={note._id} className="bg-slate-900 text-white">
                Note: {note.title}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setMessages([
                {
                  role: "assistant",
                  content: "Chat cleared. What concept can I help explain next?",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition text-xs"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                  isUser
                    ? "bg-slate-800 text-white"
                    : "bg-gradient-to-tr from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/15"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-sm whitespace-pre-wrap"
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-2 text-right font-medium ${
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
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-600 text-white flex items-center justify-center text-sm shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2.5 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Pocket Mentor is analyzing your notes & generating an answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 pl-1 flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggested:
        </span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 text-slate-700 transition flex-shrink-0 shadow-2xs disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your study doubt or question here (e.g. 'Can you quiz me on deadlocks?')..."
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 transition"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition flex items-center gap-2 disabled:opacity-40 shadow-md shadow-brand-500/20 flex-shrink-0"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
