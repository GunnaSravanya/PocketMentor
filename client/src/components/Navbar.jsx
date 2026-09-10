import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  History,
  LogOut,
  Menu,
  X,
  Bot,
  PlusCircle,
} from "lucide-react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/app", icon: LayoutDashboard },
    { name: "AI Study Chatbot", href: "/app/chat", icon: Bot, isNew: true },
    { name: "Quiz History", href: "/app/history", icon: History },
  ];

  const isActive = (path) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/app" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition relative ${
                    active
                      ? "bg-slate-900 text-cyan-400 border border-cyan-500/30 shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{link.name}</span>
                  {link.isNew && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-brand-500 text-white shadow-xs">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/app/upload"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload Notes</span>
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                {user?.Fname?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="max-w-[100px] truncate">{user?.Fname || "Student"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-800 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
              {user?.Fname?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {user?.Fname} {user?.Lname}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  active ? "bg-slate-900 text-cyan-400 border border-cyan-500/20" : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{link.name}</span>
                </div>
                {link.isNew && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500 text-white">
                    AI
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            to="/app/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-cyan-600 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Notes</span>
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
