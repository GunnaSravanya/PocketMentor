import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { api } from "../services/api";
import {
  ShieldAlert,
  Server,
  Cpu,
  Users,
  FileText,
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Database,
  Layers,
} from "lucide-react";

export const AdminPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError("");
        const [statsRes, sysRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/system"),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (sysRes.data.success) {
          setSystem(sysRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load administrative console data");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center bg-slate-900/80 rounded-3xl border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          This dashboard is reserved for administrative identities configured in the system environment (ADMIN_1 / ADMIN_2).
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading administrative telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security & System Diagnostics
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Console</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Healthy
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.stats?.totalUsers ?? 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Notes</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.stats?.totalNotes ?? 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes Generated</span>
            <BrainCircuit className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.stats?.totalQuizzes ?? 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quiz Attempts</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.stats?.totalAttempts ?? 0}</p>
        </div>
      </div>

      {/* Services & AI Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Inference Engine</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Primary Provider</span>
              <strong className="text-cyan-300 uppercase">{system?.services?.aiEngine?.provider || "groq"}</strong>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Model Configuration</span>
              <span className="font-mono text-slate-200">{system?.services?.aiEngine?.model || "qwen/qwen3.8-27b"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Fallback Protection</span>
              <span className="text-emerald-400 font-bold">Enabled (Local Deterministic)</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Backend Infrastructure</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Database</span>
              <span className="text-emerald-400 font-bold">Connected (MongoDB Atlas)</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Node Runtime</span>
              <span className="font-mono text-slate-200">{system?.system?.nodeVersion || "Node.js"}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Uptime</span>
              <span className="font-mono text-slate-200">
                {system?.system?.uptime ? `${Math.round(system.system.uptime)}s` : "Online"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
