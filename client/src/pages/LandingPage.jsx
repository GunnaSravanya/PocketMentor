import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import {
  BookOpen,
  Sparkles,
  Volume2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Repeat,
  Bot,
  Zap,
  ShieldCheck,
  Star,
} from "lucide-react";
import FallbackMentor from "../components/mentor/FallbackMentor";

const LivingMentor = lazy(() => import("../components/mentor/LivingMentor"));

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-80 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-brand-500/25 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AI-Powered Active Recall & Continuous Mastery</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Turn messy notes into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                  mastered concepts.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Upload textbook PDFs or paste rough lecture notes. Pocket Mentor extracts core concepts,
                narrates a 60-second audio summary, generates active flashcards, quizzes you with AI, and
                pinpoints your weak spots.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:scale-[1.02] text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
                >
                  <span>Start Revising Smarter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-2xl text-sm sm:text-base transition"
                >
                  Sign In to Account
                </Link>
              </div>

              {/* Social Proof Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Built for Students</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Grok AI Tutor</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>60s Audio Voice</span>
                </div>
              </div>
            </div>

            {/* Right Visual (Interactive Living AI Mentor Core) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl p-1 bg-gradient-to-tr from-cyan-500/30 via-brand-500/20 to-purple-500/30 shadow-2xl shadow-cyan-500/10">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900/90 relative flex items-center justify-center">
                  <Suspense
                    fallback={
                      <FallbackMentor
                        currentState="IDLE"
                        statusMessage="Synchronizing 3D Avatar..."
                        size="hero"
                      />
                    }
                  >
                    <LivingMentor mode="hero" />
                  </Suspense>

                  {/* Glassmorphic floating telemetry badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs pointer-events-none z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                        3D
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">Living AI Mentor</p>
                        <p className="text-[10px] text-slate-400">Interactive Cursor Physics Active</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 animate-pulse">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Continuous Mastery Loop */}
        <section className="py-20 bg-slate-900/60 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                The 5-Step Continuous Mastery Loop
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Not just another document reader. Pocket Mentor isolates weak concepts, explains mistakes, and tests your mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/50 transition flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">1. Upload Notes</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Drop lecture PDFs, slides, or paste notes directly.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/90 hover:border-cyan-500/50 transition flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">2. 60s Audio Voice</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Listen to high-yield audio summaries on the go.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/90 hover:border-emerald-500/50 transition flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">3. Active Cards</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Test your recall with flipping revision cards.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/50 transition flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">4. AI MCQ Quiz</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Take topic-tagged quizzes with instant pedagogical explanations.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/90 hover:border-rose-500/50 transition flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Repeat className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">5. Target Weak Spots</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Pinpoint topics below 60% and revise until mastered.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Pocket Mentor • AI Study & Revision Assistant</p>
      </footer>
    </div>
  );
};

export default LandingPage;
