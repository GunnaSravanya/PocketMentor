import React, { Suspense, lazy, useState, useRef, useEffect } from "react";
import { useMentorStore, MENTOR_STATES } from "../../store/mentorStore";
import { useLiveCaption } from "../../hooks/useLiveCaption";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bot,
  BrainCircuit,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Zap,
  Target,
  Activity,
  ChevronRight,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  Radio,
} from "lucide-react";
import FallbackMentor from "./FallbackMentor";
import MentorErrorBoundary from "./MentorErrorBoundary";

// Lazy-load Three.js canvas — never downloaded unless modal opens
const LivingMentor = lazy(() => import("./LivingMentor"));

// ─── State theme colours ──────────────────────────────────────────────────────
const STATE_COLORS = {
  IDLE:        { bg: "bg-slate-500/15", text: "text-slate-300",  border: "border-slate-600/40",  dot: "bg-slate-400" },
  LISTENING:   { bg: "bg-rose-500/20",  text: "text-rose-300",   border: "border-rose-500/50",   dot: "bg-rose-400"  },
  SCANNING:    { bg: "bg-violet-500/15",text: "text-violet-300", border: "border-violet-500/40", dot: "bg-violet-400"},
  ANALYZING:   { bg: "bg-cyan-500/15",  text: "text-cyan-300",   border: "border-cyan-500/40",   dot: "bg-cyan-400"  },
  THINKING:    { bg: "bg-blue-500/15",  text: "text-blue-300",   border: "border-blue-500/40",   dot: "bg-blue-400"  },
  EXPLAINING:  { bg: "bg-purple-500/15",text: "text-purple-300", border: "border-purple-500/40", dot: "bg-purple-400"},
  SUCCESS:     { bg: "bg-emerald-500/15",text:"text-emerald-300",border: "border-emerald-500/40",dot: "bg-emerald-400"},
  CELEBRATING: { bg: "bg-emerald-500/15",text:"text-emerald-300",border: "border-emerald-500/40",dot: "bg-emerald-400"},
  ENCOURAGING: { bg: "bg-amber-500/15", text: "text-amber-300",  border: "border-amber-500/40",  dot: "bg-amber-400" },
  FOCUSED:     { bg: "bg-amber-500/15", text: "text-amber-300",  border: "border-amber-500/40",  dot: "bg-amber-400" },
  WARNING:     { bg: "bg-rose-500/15",  text: "text-rose-300",   border: "border-rose-500/40",   dot: "bg-rose-400"  },
  REVISING:    { bg: "bg-orange-500/15",text: "text-orange-300", border: "border-orange-500/40", dot: "bg-orange-400"},
};

// ─── Local Fallback Generator for Guests & Offline Mode ──────────────────────
function getLocalMentorFallback(userMessage, context) {
  const msg = (userMessage || "").toLowerCase();
  const subject = context?.activeSubject || "your study material";

  if (msg.includes("memory management") || msg.includes("paging") || msg.includes("virtual memory")) {
    return `### Memory Management Overview

**Memory Management** is the core process by which an operating system dynamically allocates, tracks, and recycles computer memory (RAM) for active processes.

#### Key Concepts & Mechanisms:
1. **Memory Allocation**: Assigns memory blocks dynamically to running applications via the **Stack** (local variables, function calls) and **Heap** (dynamically allocated objects).
2. **Paging & Virtual Memory**: Divides logical memory into fixed-size pages mapped to physical frames, allowing programs to exceed physical RAM limits.
3. **Protection & Isolation**: Ensures process address spaces remain isolated to prevent memory corruption and unauthorized access.
4. **Deallocation & Garbage Collection**: Reclaims unused memory automatically or via explicit deallocation to avoid memory leaks.`;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `Hello! I'm your 3D Living AI Mentor. I'm ready to help you master **${subject}**. What concept would you like to explore today?`;
  }

  const topicName = userMessage.replace(/^(explain|what is|tell me about|how does|define|summarize)\s+/i, "").trim() || subject;

  return `### Concept Explanation: ${topicName}

Understanding **${topicName}** is essential for mastering **${subject}**.

#### Core Highlights:
1. **Foundational Concept**: Core principles define how this system operates under standard conditions.
2. **Key Mechanism**: Components interact dynamically to process input, maintain state, and produce accurate outputs.
3. **Study Strategy**: Review your course materials for key formulas, edge cases, and practical examples to reinforce this concept.

Feel free to ask follow-up questions or request a practice problem!`;
}

// ─── Resilient API call to Grok/Groq for chat responses ──────────────────────
async function fetchMentorReply(userMessage, context) {
  try {
    const res = await fetch("/api/mentor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: userMessage,
        subject: context?.activeSubject || null,
        topic: context?.activeTopic || null,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.data?.reply) {
      return data.data.reply;
    }
    if (data?.data?.reply) return data.data.reply;
    if (data?.message && !data.message.toLowerCase().includes("authorized") && !data.message.toLowerCase().includes("token")) {
      return data.message;
    }
  } catch (err) {
    console.warn("[Mentor Chat API Notice] Using local AI mentor response:", err);
  }

  return getLocalMentorFallback(userMessage, context);
}

export const MentorSpaceModal = () => {
  const {
    isMentorSpaceOpen,
    setMentorSpaceOpen,
    currentState,
    statusMessage,
    context,
    isLivingMentorEnabled,
    setLivingMentorEnabled,
    chatMessages,
    liveCaption,
    spokenText,
    isSpeaking,
    isChatLoading,
    addChatMessage,
    setIsChatLoading,
    setMentorState,
    stopSpeaking,
  } = useMentorStore();

  const { speak, stopSpeaking: stopTTS } = useLiveCaption();
  const { isListening, isSupported: isVoiceSupported, toggleListening, stopListening } = useVoiceInput();

  const [inputText, setInputText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const inputRef = useRef(null);
  const responseScrollRef = useRef(null);

  const { activeSubject, activeTopic, weakTopics, topicMastery, accuracy, streak } = context;
  const stateTheme = STATE_COLORS[currentState] || STATE_COLORS.IDLE;

  // Latest mentor message
  const latestMentorMessage = [...chatMessages].reverse().find((m) => m.role === "mentor");

  // Welcome message on first open
  useEffect(() => {
    if (isMentorSpaceOpen && chatMessages.length === 0) {
      const welcome = activeSubject
        ? `Hello! I'm your AI Mentor. I can see you're studying **${activeSubject}**. What would you like to explore?`
        : "Hello! I'm your Living AI Mentor. Ask me anything about your study material — I'm here to help you master every concept.";
      useMentorStore.getState().addChatMessage("mentor", welcome);
      if (!isMuted) {
        setTimeout(() => speak(welcome.replace(/\*\*/g, "")), 600);
      }
    }
    // eslint-disable-next-line
  }, [isMentorSpaceOpen]);

  // Auto-scroll response screen when live caption or spoken text updates
  useEffect(() => {
    if (responseScrollRef.current) {
      responseScrollRef.current.scrollTop = responseScrollRef.current.scrollHeight;
    }
  }, [spokenText, liveCaption, latestMentorMessage]);

  const handleSend = async (customMsg = null) => {
    const msg = (typeof customMsg === "string" ? customMsg : inputText).trim();
    if (!msg || isChatLoading) return;

    if (isListening) {
      stopListening();
    }

    setInputText("");
    addChatMessage("user", msg);
    setIsChatLoading(true);
    setMentorState(MENTOR_STATES.THINKING, "Processing your question...");

    stopTTS?.();

    const reply = await fetchMentorReply(msg, context);

    addChatMessage("mentor", reply);
    setIsChatLoading(false);
    setMentorState(MENTOR_STATES.EXPLAINING, "Explaining concept...");

    if (!isMuted) {
      speak(reply);
    } else {
      useMentorStore.getState().setSpokenText(reply);
      setTimeout(() => {
        if (useMentorStore.getState().currentState === MENTOR_STATES.EXPLAINING) {
          useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Active and ready.");
        }
      }, 2500);
    }
  };

  const handleVoiceToggle = () => {
    toggleListening({
      onTranscriptChange: (text) => {
        setInputText(text);
      },
      onFinalTranscript: (text) => {
        setInputText(text);
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClose = () => {
    stopTTS?.();
    if (isListening) stopListening();
    setMentorSpaceOpen(false);
  };

  // Text to render in the transparent screen:
  // When speaking, only render the text revealed progressively in sync with speech!
  const displayText = isSpeaking && spokenText ? spokenText : latestMentorMessage?.text || "";

  if (!isMentorSpaceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-2xl animate-mentor-in">
      {/* ── MAIN MODAL CARD ── */}
      <div className="relative w-full max-w-[1380px] h-[95vh] max-h-[920px] bg-[#070712] border border-slate-800/90 rounded-2xl shadow-[0_0_100px_rgba(6,182,212,0.12)] overflow-hidden flex flex-col">

        {/* ── TOP HEADER BAR ── */}
        <div className="flex-none h-14 px-4 sm:px-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title={isSidebarCollapsed ? "Expand side metrics" : "Collapse side metrics"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-cyan-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2 leading-none">
                Living AI Mentor
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${stateTheme.bg} ${stateTheme.text} border ${stateTheme.border} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stateTheme.dot} animate-pulse`} />
                  {currentState}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                Interactive Study Companion • Real-Time Voice Synthesis & Speech Stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chat History Drawer Toggle Button */}
            <button
              onClick={() => setIsHistoryDrawerOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                isHistoryDrawerOpen
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
              title="View full conversation history"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>History</span>
              {chatMessages.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-[9px] text-cyan-200 font-mono font-bold">
                  {chatMessages.length}
                </span>
              )}
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={() => { if (isMuted) {} else stopTTS?.(); setIsMuted((m) => !m); }}
              title={isMuted ? "Unmute mentor voice" : "Mute mentor voice"}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* 3D / 2D toggle */}
            <button
              onClick={() => setLivingMentorEnabled(!isLivingMentorEnabled)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                isLivingMentorEnabled
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
              title="Toggle 3D/2D visual mode"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLivingMentorEnabled ? "3D" : "2D"}
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── BODY: COLLAPSIBLE SIDEBAR + EXPANSIVE 3D STAGE ── */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* ════════════════════════════════════════
              LEFT: TELEMETRY SIDEBAR (COLLAPSIBLE)
          ════════════════════════════════════════ */}
          {!isSidebarCollapsed && (
            <aside className="w-[260px] flex-none border-r border-slate-800/80 flex flex-col bg-slate-950/60 overflow-y-auto custom-scrollbar animate-fadeIn z-20">
              {/* STATUS CORE */}
              <div className="p-4 border-b border-slate-800/60">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Status Core</p>
                <div className={`rounded-xl p-3 ${stateTheme.bg} border ${stateTheme.border}`}>
                  <p className={`text-xs font-semibold ${stateTheme.text} leading-snug`}>
                    {statusMessage || "Active and ready."}
                  </p>
                  {activeSubject && (
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Target className="w-3 h-3 text-cyan-400" />
                      {activeSubject}
                    </p>
                  )}
                </div>
              </div>

              {/* TOPIC MASTERY */}
              <div className="p-4 border-b border-slate-800/60 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Topic Mastery
                </p>

                {topicMastery && topicMastery.length > 0 ? (
                  <div className="space-y-3">
                    {topicMastery.map((item) => (
                      <div key={item.topic}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-300 font-medium truncate pr-1 flex items-center gap-1">
                            {item.mastered || item.accuracy >= 70
                              ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-none" />
                              : <AlertTriangle className="w-2.5 h-2.5 text-amber-400 flex-none" />
                            }
                            {item.topic}
                          </span>
                          <span className={`text-[10px] font-mono font-bold flex-none ${
                            (item.mastered || item.accuracy >= 70) ? "text-emerald-400" : "text-amber-400"
                          }`}>
                            {item.accuracy ?? item.percentage ?? 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              (item.mastered || item.accuracy >= 70)
                                ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                                : "bg-gradient-to-r from-amber-500 to-rose-400"
                            }`}
                            style={{ width: `${Math.max(item.accuracy ?? item.percentage ?? 0, 4)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BrainCircuit className="w-7 h-7 mx-auto mb-2 text-slate-700" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Complete quizzes to build your mastery map
                    </p>
                  </div>
                )}
              </div>

              {/* WEAK AREAS */}
              {weakTopics && weakTopics.length > 0 && (
                <div className="p-4 border-b border-slate-800/60">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500/90 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Reinforce
                  </p>
                  <div className="space-y-1.5">
                    {weakTopics.slice(0, 3).map((t) => (
                      <div key={t} className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-500/20">
                        <ChevronRight className="w-2.5 h-2.5 flex-none text-amber-400" />
                        <span className="truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* METRICS */}
              <div className="p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3">Session Metrics</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Accuracy</span>
                    <span className="text-white font-mono font-bold">{accuracy ?? 100}%</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Streak</span>
                    <span className="text-white font-mono font-bold">{streak ?? 0} 🔥</span>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* ════════════════════════════════════════
              CENTER / STAGE: 3D MENTOR & TRANSPARENT SCREEN
          ════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col overflow-hidden relative">

            {/* 3D RENDER CANVAS + FLOATING TRANSPARENT HUD */}
            <div className="flex-1 relative overflow-hidden min-h-0">
              <MentorErrorBoundary
                currentState={currentState}
                statusMessage={statusMessage}
                size="hero"
              >
                {isLivingMentorEnabled ? (
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-[#070712]">
                        <FallbackMentor
                          currentState={currentState}
                          statusMessage="Initializing 3D Neural Mesh..."
                          size="hero"
                        />
                      </div>
                    }
                  >
                    <div className="w-full h-full">
                      <LivingMentor mode="space" />
                    </div>
                  </Suspense>
                ) : (
                  <div className="w-full h-full bg-[#070712] flex items-center justify-center">
                    <FallbackMentor
                      currentState={currentState}
                      statusMessage="2D Lightweight Mode Active"
                      size="hero"
                    />
                  </div>
                )}
              </MentorErrorBoundary>

              {/* ── COMPLETELY TRANSPARENT HOLOGRAPHIC KNOWLEDGE HUD (BESIDE CHARACTER) ── */}
              <div className="absolute top-4 right-4 bottom-4 w-[460px] max-w-[92%] pointer-events-auto z-20 flex flex-col">
                <div className="flex-1 bg-slate-950/20 backdrop-blur-md border border-cyan-500/25 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col overflow-hidden">
                  
                  {/* Transparent Screen Header */}
                  <div className="flex-none flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                        {isSpeaking ? "Live Neural Stream" : "Knowledge Feed"}
                      </span>
                    </div>

                    {isSpeaking && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/50 text-[10px] font-mono text-purple-200">
                        <Radio className="w-3 h-3 text-purple-300 animate-pulse" />
                        Speaking
                      </div>
                    )}
                  </div>

                  {/* Transparent Screen Content: Progressive Speech Reveal */}
                  <div ref={responseScrollRef} className="flex-1 overflow-y-auto custom-scrollbar my-3 pr-1 space-y-3">
                    {/* Live Sentence Window (Current sentence being spoken) */}
                    {isSpeaking && liveCaption && (
                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                        <div className="flex items-center gap-1.5 mb-1 text-purple-400 text-[10px] font-mono">
                          <Mic className="w-3 h-3 animate-pulse" />
                          <span>Voice Stream</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-purple-100 leading-snug">
                          {liveCaption}
                        </p>
                      </div>
                    )}

                    {/* Progressively Revealed Text as it Speaks (or full response) */}
                    {displayText ? (
                      <div className="text-slate-100 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                        {displayText}
                        {isSpeaking && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                        <Sparkles className="w-8 h-8 text-cyan-500/40 mb-2 animate-pulse" />
                        <p className="text-xs text-slate-400 font-medium">Ready to explain any topic</p>
                        <p className="text-[10px] text-slate-500 mt-1">Speak into the mic or ask a question below</p>
                      </div>
                    )}

                    {isChatLoading && (
                      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-2.5 text-cyan-300 text-xs">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>Synthesizing cognitive explanation...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Suggestion Chips */}
                  <div className="flex-none pt-2 border-t border-cyan-500/15 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSend("Explain in simple terms with an analogy")}
                      disabled={isChatLoading}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-cyan-950/80 hover:text-cyan-300 border border-cyan-500/20 text-[10px] text-slate-300 transition flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      Simple Analogy
                    </button>
                    <button
                      onClick={() => handleSend("Give a real-world example")}
                      disabled={isChatLoading}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-cyan-950/80 hover:text-cyan-300 border border-cyan-500/20 text-[10px] text-slate-300 transition flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      Real-World Example
                    </button>
                    <button
                      onClick={() => handleSend("Quiz me on this concept")}
                      disabled={isChatLoading}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-cyan-950/80 hover:text-cyan-300 border border-cyan-500/20 text-[10px] text-slate-300 transition flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-emerald-400" />
                      Quiz Me
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FLOATING CLEAN TRANSPARENT BOTTOM PROMPT BAR WITH VOICE INPUT ── */}
            <div className="flex-none p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800/60 backdrop-blur-md z-20">
              <div className="max-w-[920px] mx-auto">
                <div className={`flex items-center gap-2 bg-slate-900/60 border ${
                  isListening ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]" : "border-cyan-500/30 focus-within:border-cyan-400"
                } rounded-xl px-3 sm:px-4 py-2 backdrop-blur-md shadow-lg transition-all`}>
                  
                  {/* Voice Input (Speech-to-Text) Button */}
                  <button
                    onClick={handleVoiceToggle}
                    type="button"
                    className={`flex-none p-2 rounded-lg transition flex items-center justify-center ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                        : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80"
                    }`}
                    title={isListening ? "Stop listening" : "Speak to your mentor (English Voice Input)"}
                  >
                    {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isListening
                        ? "Listening to your voice... (Speak now)"
                        : "Ask your mentor anything or click mic to speak..."
                    }
                    disabled={isChatLoading}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none min-w-0 disabled:opacity-50 font-sans"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || isChatLoading}
                    className="flex-none w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                    title="Send question"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    {isListening ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Listening to mic... (Press Enter or Send when done)
                      </span>
                    ) : (
                      <>Press <kbd className="text-slate-300 font-sans px-1 rounded bg-slate-800 border border-slate-700">Enter</kbd> to ask or click <Mic className="w-3 h-3 inline text-cyan-400" /> to talk</>
                    )}
                  </span>
                  <span>Neural Stream • {isMuted ? "Audio Muted" : "Voice Active"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════
              SLIDE-OVER CHAT HISTORY DRAWER
          ════════════════════════════════════════ */}
          {isHistoryDrawerOpen && (
            <div className="absolute inset-y-0 right-0 w-[420px] max-w-full bg-[#0a0a18] border-l border-slate-800/90 shadow-2xl z-30 flex flex-col animate-slideLeft">
              {/* History Header */}
              <div className="flex-none h-14 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conversation History</h3>
                </div>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Message Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 px-1">
                      {msg.role === "mentor" ? (
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Mentor
                        </span>
                      ) : (
                        <span className="text-violet-400 font-bold">You</span>
                      )}
                      <span>• {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}</span>
                    </div>

                    <div className={`group relative max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "mentor"
                        ? "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm"
                        : "bg-violet-600/30 text-violet-100 border border-violet-500/40 rounded-tr-sm"
                    }`}>
                      {msg.text}

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-800/90 text-slate-400 hover:text-white transition"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MentorSpaceModal;
