import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNoteStore } from "../store/noteStore";
import {
  Upload,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileUp,
  Bot,
  Sparkles,
} from "lucide-react";
import { mentorEvents } from "../services/mentorEvents";

export const UploadNotesPage = () => {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scanStep, setScanStep] = useState("");

  const { createNote, uploading } = useNoteStore();
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const noteTitle = title.trim() || (file ? file.name.replace(/\.[^/.]+$/, "") : "Study Notes");

    if (activeTab === "file") {
      if (!file) {
        setErrorMessage("Please select or drop a document file first.");
        return;
      }

      mentorEvents.noteUploaded(noteTitle);
      setScanStep("Reading material & detecting structure...");

      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) {
        formData.append("title", title.trim());
      }

      setTimeout(() => setScanStep("Understanding concepts & terminology..."), 1200);

      const result = await createNote(formData, true);
      if (result.success && result.data?.noteId) {
        mentorEvents.kitReady();
        navigate(`/app/notes/${result.data.noteId}`);
      } else {
        mentorEvents.resetToIdle();
        setErrorMessage(result.message || "Failed to process document");
      }
    } else {
      if (!text.trim() || text.trim().length < 10) {
        setErrorMessage("Please paste sufficient study notes (at least 10 characters).");
        return;
      }

      mentorEvents.noteUploaded(noteTitle);
      setScanStep("Analyzing raw study notes...");

      const payload = {
        title: title.trim() || "Untitled Note",
        text: text.trim(),
        sourceType: "text",
      };

      const result = await createNote(payload, false);
      if (result.success && result.data?.noteId) {
        mentorEvents.kitReady();
        navigate(`/app/notes/${result.data.noteId}`);
      } else {
        mentorEvents.resetToIdle();
        setErrorMessage(result.message || "Failed to save notes");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-800/90 shadow-xl p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Add Study Notes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload your lecture PDF or paste raw text. Pocket Mentor will index the material with AI.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-950 p-1.5 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "file"
                ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document (PDF / TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "text"
                ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Raw Notes</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeTab === "file"
                  ? "e.g. Operating Systems - Deadlocks & Scheduling"
                  : "e.g. Distributed Systems Lecture 4"
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition"
            />
          </div>

          {activeTab === "file" ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Select or Drop File
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-500/10"
                    : file
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md,application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center pointer-events-none">
                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                      </p>
                      <span className="mt-3 text-xs text-cyan-400 font-bold underline">
                        Click or drag to replace
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-3">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-200">
                        Drag and drop your PDF or document here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PDF, TXT, Markdown (Max 15MB)
                      </p>
                      <span className="mt-3 inline-block px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 shadow-sm">
                        Browse from computer
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Study Notes Text
              </label>
              <textarea
                rows={10}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste lecture notes, summary points, textbook excerpts, definitions, formulas..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm font-mono transition resize-y"
              />
              <p className="text-xs text-slate-500 mt-1">
                {text.length} characters entered.
              </p>
            </div>
          )}

          {uploading && (
            <div className="relative p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 overflow-hidden space-y-2">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>{scanStep || "Living Mentor Analyzing Document..."}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  SCANNING
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:scale-[1.01] text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/15 flex items-center justify-center gap-2 text-sm transition disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting & Processing Notes with AI...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Process & Save Study Notes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNotesPage;
