import React from "react";

export const Logo = ({ size = "md", showSubtitle = true, className = "", isDark = true }) => {
  const sizeMap = {
    sm: { icon: "w-7 h-7", text: "text-lg", sub: "text-[9px]" },
    md: { icon: "w-9 h-9", text: "text-xl", sub: "text-[10px]" },
    lg: { icon: "w-11 h-11", text: "text-2xl", sub: "text-xs" },
    xl: { icon: "w-14 h-14", text: "text-3xl", sub: "text-xs" },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Vector Emblem */}
      <div
        className={`${s.icon} relative rounded-2xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-cyan-500 flex items-center justify-center p-2 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 transition group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          {/* Open Book Wings */}
          <path
            d="M16 23.5C13.5 21.8 8 21.5 4 23V8C8 6.5 13.5 6.8 16 8.5M16 23.5C18.5 21.8 24 21.5 28 23V8C24 6.5 18.5 6.8 16 8.5M16 23.5V8.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* AI Neural Spark at apex */}
          <circle cx="16" cy="4" r="2" fill="#38bdf8" />
          <path
            d="M16 4V6.5M14 4H18"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Ambient Glow */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-brand-500 opacity-30 blur-sm pointer-events-none"></div>
      </div>

      {/* Brand Text */}
      <div>
        <div className={`${s.text} font-black tracking-tight leading-tight text-white flex items-center`}>
          <span>Pocket</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 ml-0.5">
            Mentor
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1 animate-pulse"></span>
        </div>
        {showSubtitle && (
          <span className={`${s.sub} block uppercase tracking-widest font-bold text-slate-400 -mt-0.5`}>
            AI Study Assistant
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
