import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Navbar } from "../components/Navbar";
import { FloatingChatbot } from "../components/FloatingChatbot";
import { Loader2 } from "lucide-react";

export const AppLayout = () => {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-400">Loading Pocket Mentor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-cyan-500 selection:text-white">
      {/* Subtle ambient glows matching landing page */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-brand-600/10 via-cyan-600/5 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <FloatingChatbot />
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Pocket Mentor — AI-Powered Study & Revision Assistant • Built for students
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
