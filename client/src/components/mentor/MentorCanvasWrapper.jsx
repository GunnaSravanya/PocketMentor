/**
 * MentorCanvasWrapper — v2
 * CSS-only environment backdrop for the Living AI Mentor 3D stage.
 * NO geometry, NO WebGL cost for the background — only the character uses GPU.
 * Uses pure CSS gradients + a dot-grid overlay for a cinematic sci-fi feel.
 */
import React from "react";

export default function MentorCanvasWrapper({ children }) {
  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl border border-zinc-800/80 shadow-2xl bg-[#08080d]"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.18) 0%, transparent 55%)",
          "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.10) 0%, transparent 40%)",
          "radial-gradient(circle at 20% 70%, rgba(168, 85, 247, 0.10) 0%, transparent 45%)",
          "linear-gradient(to bottom, #09090f 0%, #060610 40%, #04040c 100%)",
        ].join(", "),
      }}
    >
      {/* Dot-grid scanline overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Hexagonal subtle grid — adds depth without geometry cost */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: [
            "linear-gradient(60deg, #06b6d4 1px, transparent 1px)",
            "linear-gradient(-60deg, #8b5cf6 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "40px 70px",
        }}
      />

      {/* Top accent strip */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-0 pointer-events-none" />

      {/* Floor gradient — ground plane illusion */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-cyan-500/[0.07] to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none z-0" />

      {/* Vignette edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent z-0 pointer-events-none opacity-70" />

      {/* Canvas layer — sits above all backdrops */}
      <div className="relative w-full h-full z-10">
        {children}
      </div>
    </div>
  );
}
