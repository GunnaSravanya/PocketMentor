import { useEffect } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Logo } from "../components/Logo";

export const AuthLayout = () => {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-600/20 via-cyan-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <Link to="/" className="inline-block group mb-3">
          <Logo size="lg" />
        </Link>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Turn your messy study notes into mastered concepts with AI.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-cyan-950/40 rounded-3xl border border-slate-800/90">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
