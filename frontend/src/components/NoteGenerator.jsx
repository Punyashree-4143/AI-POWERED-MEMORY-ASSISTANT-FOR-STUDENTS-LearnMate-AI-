import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  Code2,
  FileText,
  HelpCircle,
  Layers3,
  Loader2,
  MessageSquare,
  Network,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/notes";

export default function NoteGenerator() {
  const [text, setText] = useState(() => {
    return localStorage.getItem("noteText") || "";
  });
  const [noteId, setNoteId] = useState(() => {
    return localStorage.getItem("noteId") || null;
  });
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadMeta, setUploadMeta] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("noteText", text);
  }, [text]);

  useEffect(() => {
    if (noteId) {
      localStorage.setItem("noteId", noteId);
    }
  }, [noteId]);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));

    return { words, minutes };
  }, [text]);

  const createNote = async () => {
    if (!text) {
      alert("Enter text or upload PDF first");
      return null;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/create`, { text });
      setNoteId(res.data._id);
      return res.data._id;
    } catch (error) {
      alert("Error creating note");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadPDF = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      setUploadMeta(null);

      const res = await axios.post(`${API_URL}/upload-pdf`, formData);

      setText(res.data.note.text);
      setNoteId(res.data.note._id);
      setUploadMeta({
        method: res.data.extractionMethod,
        corrected: res.data.correctedForDisplay,
        name: file.name,
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
      setDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    uploadPDF(event.dataTransfer.files?.[0]);
  };

  const runGeneration = async (type) => {
    let id = noteId;

    if (!id) {
      id = await createNote();
      if (!id) return;
    }

    const routes = {
      summarize: `/summary/${id}`,
      flashcards: `/flashcards/${id}`,
      quiz: `/quiz/${id}`,
    };

    try {
      setLoading(true);
      await axios.post(`${API_URL}/${type}/${id}`);
      navigate(routes[type]);
    } catch (error) {
      alert(`${type} generation failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered learning workspace
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            AI Learning Assistant for Students
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Upload printed PDFs, handwritten scans, or images. The platform
            extracts, cleans, and prepares your notes for summaries,
            flashcards, quizzes, mind maps, and visual explanations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          {[
            ["Words", stats.words],
            ["Read time", `${stats.minutes} min`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl"
            >
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-[2rem] border border-dashed p-6 transition ${
              dragging
                ? "border-cyan-300 bg-cyan-300/10"
                : "border-white/15 bg-white/[0.06]"
            } backdrop-blur-xl`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
                  <UploadCloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Upload notes
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Drag and drop a PDF/image, or browse from your device.
                  </p>
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
                <UploadCloud className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  hidden
                  accept=".pdf,image/*"
                  onChange={(event) => uploadPDF(event.target.files[0])}
                />
              </label>
            </div>

            {uploadMeta && (
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                {uploadMeta.name} processed with {uploadMeta.method}
                {uploadMeta.corrected ? " and AI OCR cleanup" : ""}.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Clean note canvas
                </h2>
                <p className="text-sm text-slate-400">
                  Corrected OCR appears here before generation.
                </p>
              </div>
              {loading && (
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-100">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing
                </span>
              )}
            </div>

            <textarea
              className="min-h-[360px] w-full resize-y rounded-3xl border border-white/10 bg-[#060a1a]/80 p-5 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
              placeholder="Paste notes here or upload a PDF/image..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-500/20 text-purple-100">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Generate</h2>
                <p className="text-sm text-slate-400">
                  Create learning assets from the current note.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <ActionButton
                icon={FileText}
                label="Summarize"
                onClick={() => runGeneration("summarize")}
              />
              <ActionButton
                icon={Layers3}
                label="Flashcards"
                onClick={() => runGeneration("flashcards")}
              />
              <ActionButton
                icon={HelpCircle}
                label="Quiz"
                onClick={() => runGeneration("quiz")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <LearningPreview
              icon={Network}
              title="Mind Map"
              text="Concept nodes, dependencies, and revision paths generated from your notes."
              onClick={() => navigate("/workspace/mind-maps")}
            />
            <LearningPreview
              icon={BrainCircuit}
              title="Infographics"
              text="AI-generated educational cards for definitions, flows, and comparisons."
              onClick={() => navigate("/workspace/infographics")}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-cyan-300" />
        {label}
      </span>
      <BookOpen className="h-4 w-4 text-slate-500 transition group-hover:text-cyan-200" />
    </button>
  );
}

function LearningPreview({ icon: Icon, title, text, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="cursor-pointer rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
    >
      <Icon className="mb-4 h-5 w-5 text-cyan-300" />
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </motion.div>
  );
}
