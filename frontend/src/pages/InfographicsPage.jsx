import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  BookOpen,
  GitBranch,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/notes";

const accentClasses = {
  purple: "from-purple-500/30 to-purple-950/30 border-purple-300/20",
  cyan: "from-cyan-400/25 to-blue-950/30 border-cyan-300/20",
  emerald: "from-emerald-400/25 to-emerald-950/30 border-emerald-300/20",
  amber: "from-amber-300/25 to-orange-950/30 border-amber-300/20",
  pink: "from-pink-400/25 to-fuchsia-950/30 border-pink-300/20",
};

const typeIcons = {
  definition: BookOpen,
  formula: BarChart3,
  process: GitBranch,
  comparison: GitBranch,
  example: Lightbulb,
};

export default function InfographicsPage() {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const noteId = localStorage.getItem("noteId");
  const infographic = note?.infographic;

  useEffect(() => {
    if (!noteId) return;
    axios.get(`${API_URL}/${noteId}`).then((res) => setNote(res.data));
  }, [noteId]);

  const chartData = useMemo(() => {
    return (infographic?.cards || []).map((card, index) => ({
      name: card.title.slice(0, 12),
      value: Math.max(1, card.content.split(/\s+/).length),
      index: index + 1,
    }));
  }, [infographic]);

  const generateInfographic = async () => {
    if (!noteId) {
      alert("Upload or create a note first");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/infographic/${noteId}`);
      setNote(res.data);
    } catch (error) {
      alert("Infographic generation failed");
    } finally {
      setLoading(false);
    }
  };

  const hasInfographic = (infographic?.cards || []).length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-5"
    >
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-300/10 px-3 py-1 text-xs text-purple-100">
              <BarChart3 className="h-3.5 w-3.5" />
              Infographic builder
            </div>
            <h1 className="text-3xl font-semibold text-white">
              {infographic?.title || "Infographics"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Convert summaries and note content into visual cards, step flows,
              and lightweight charts for quick review.
            </p>
          </div>
          <button
            onClick={generateInfographic}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Infographic
          </button>
        </div>
      </div>

      {hasInfographic ? (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            {infographic.cards.map((card, index) => {
              const Icon = typeIcons[card.type] || BookOpen;

              return (
                <motion.article
                  key={`${card.title}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`rounded-3xl border bg-gradient-to-br p-5 ${
                    accentClasses[card.accent] || accentClasses.purple
                  }`}
                >
                  <Icon className="mb-4 h-5 w-5 text-cyan-100" />
                  <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">
                    {card.type}
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {card.content}
                  </p>
                </motion.article>
              );
            })}
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
              <h2 className="mb-5 text-lg font-semibold text-white">
                Learning Flow
              </h2>
              <div className="space-y-4">
                {(infographic.flow || []).map((step, index) => (
                  <div key={`${step.title}-${index}`} className="flex gap-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-300 text-sm font-bold text-slate-950">
                      {index + 1}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
              <h2 className="mb-5 text-lg font-semibold text-white">
                Concept Weight
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="conceptFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,.12)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,.12)",
                        borderRadius: 16,
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#22d3ee"
                      fill="url(#conceptFill)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid min-h-[480px] place-items-center rounded-[2rem] border border-white/10 bg-white/[0.05] px-6 text-center backdrop-blur-xl">
          <div>
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-purple-300" />
            <h2 className="text-xl font-semibold text-white">
              No infographic yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Upload notes, then generate visual cards with definitions,
              formulas, examples, process flows, and chart-style emphasis.
            </p>
          </div>
        </div>
      )}
    </motion.section>
  );
}
