import React, { useState, useEffect } from "react";
import { MENTOR_STATES } from "../../store/mentorStore";

export default function FallbackMentor({ currentState = "IDLE", statusMessage = "", size = "md" }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle subtle cursor tracking for the digital core lens
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Clamp bounds safely
      const x = ((e.clientX / innerWidth) - 0.5) * 20;
      const y = ((e.clientY / innerHeight) - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  // Color & animation themes mapped to cognitive states
  const getTheme = () => {
    switch (currentState) {
      case MENTOR_STATES.SCANNING:
        return { primary: "#a855f7", secondary: "#c084fc", glow: "rgba(168, 85, 247, 0.5)", ringAnim: "animate-spin" };
      case MENTOR_STATES.ANALYZING:
        return { primary: "#06b6d4", secondary: "#38bdf8", glow: "rgba(6, 182, 212, 0.5)", ringAnim: "animate-spin duration-700" };
      case MENTOR_STATES.THINKING:
        return { primary: "#3b82f6", secondary: "#60a5fa", glow: "rgba(59, 130, 246, 0.4)", ringAnim: "animate-pulse" };
      case MENTOR_STATES.EXPLAINING:
        return { primary: "#8b5cf6", secondary: "#a78bfa", glow: "rgba(139, 92, 246, 0.5)", ringAnim: "animate-pulse" };
      case MENTOR_STATES.SUCCESS:
      case MENTOR_STATES.CELEBRATING:
        return { primary: "#10b981", secondary: "#34d399", glow: "rgba(16, 185, 129, 0.5)", ringAnim: "scale-105 duration-300" };
      case MENTOR_STATES.REVISING:
      case MENTOR_STATES.FOCUSED:
        return { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245, 158, 11, 0.45)", ringAnim: "animate-pulse" };
      case MENTOR_STATES.WARNING:
        return { primary: "#ef4444", secondary: "#f87171", glow: "rgba(239, 68, 68, 0.5)", ringAnim: "animate-ping" };
      default:
        return { primary: "#38bdf8", secondary: "#60a5fa", glow: "rgba(56, 189, 248, 0.35)", ringAnim: "animate-pulse" };
    }
  };

  const theme = getTheme();

  const sizeClasses = {
    sm: "w-28 h-28",
    md: "w-44 h-44",
    lg: "w-64 h-64",
    hero: "w-72 sm:w-80 h-72 sm:h-80",
  }[size] || "w-44 h-44";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-none p-4">
      {/* Background Hologram Scanner Grid */}
      <div
        className="absolute inset-0 opacity-15 rounded-3xl pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${theme.primary} 1.2px, transparent 1.2px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Main Core Assembly */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* Ambient volumetric glow background */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: theme.glow }}
        />

        {/* Outer Hex Tech Orbit Ring */}
        <div
          className="absolute w-full h-full rounded-full border border-dashed opacity-40 transition-all duration-700"
          style={{
            borderColor: theme.primary,
            boxShadow: `0 0 25px ${theme.glow}`,
            transform: prefersReducedMotion ? "none" : "rotate(35deg)",
          }}
        />

        {/* Dynamic State Status Ring */}
        <div
          className={`absolute w-[82%] h-[82%] rounded-full border-2 border-double opacity-70 transition-all duration-500 ${
            prefersReducedMotion ? "" : theme.ringAnim
          }`}
          style={{
            borderColor: theme.primary,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
          }}
        />

        {/* Inner Laser Data Arc */}
        <div
          className="absolute w-[68%] h-[68%] rounded-full border border-cyan-400/50 opacity-60"
          style={{
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            transform: `rotate(${mousePos.x * 2}deg)`,
          }}
        />

        {/* Central Intelligent Eye Core */}
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          className="relative transition-transform duration-200 ease-out z-10"
          style={{
            transform: prefersReducedMotion ? "none" : `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        >
          <defs>
            <radialGradient id="hologramCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor={theme.primary} stopOpacity="0.8" />
              <stop offset="75%" stopColor={theme.secondary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Holographic Glowing Field */}
          <circle cx="50" cy="50" r="46" fill="url(#hologramCoreGlow)" className="opacity-80" />

          {/* HUD Tech Reticle Accents */}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke={theme.primary}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            className={prefersReducedMotion ? "" : "animate-[spin_16s_linear_infinite]"}
          />
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 4"
            className="opacity-70"
          />

          {/* Central Intelligent Iris / Core Beam */}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="#ffffff"
            style={{ filter: `drop-shadow(0 0 12px ${theme.primary})` }}
          />
          <circle cx="50" cy="50" r="4.5" fill="#030712" />
        </svg>

        {/* Scanning horizontal beam when scanning */}
        {currentState === MENTOR_STATES.SCANNING && !prefersReducedMotion && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-[1px] animate-[pulse_1s_ease-in-out_infinite]"
            style={{ top: "45%" }}
          />
        )}
      </div>

      {/* Telemetry Text Display */}
      <div className="mt-4 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          <span>Living Mentor • {currentState}</span>
        </div>
        {statusMessage && (
          <p className="text-xs text-slate-300 max-w-xs mt-1.5 line-clamp-2 font-medium">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
