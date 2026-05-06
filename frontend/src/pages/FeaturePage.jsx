import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  Images,
  Map,
  PanelsTopLeft,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const featureConfig = {
  summaries: {
    title: "Summaries",
    icon: FileText,
    accent: "from-purple-500 to-cyan-400",
    description: "Generate layered explanations from your uploaded notes.",
  },

  flashcards: {
    title: "Flashcards",
    icon: PanelsTopLeft,
    accent: "from-emerald-400 to-cyan-400",
    description: "Turn dense handwritten notes into revision cards.",
  },

  quizzes: {
    title: "Quizzes",
    icon: HelpCircle,
    accent: "from-fuchsia-500 to-purple-400",
    description: "Practice with AI-generated MCQs and explanations.",
  },

  "mind-maps": {
    title: "Mind Maps",
    icon: Map,
    accent: "from-cyan-400 to-blue-500",
    description: "Visualize concepts as connected learning maps.",
  },

  infographics: {
    title: "Infographics",
    icon: Images,
    accent: "from-amber-300 to-purple-500",
    description: "Create visual explanations and diagram-style summaries.",
  },
};

export default function FeaturePage({ type }) {
  const config = featureConfig[type] || featureConfig.summaries;
  const Icon = config.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent}`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {config.title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {config.description}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-cyan-100">
            Connected to your note workspace
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["AI generation", "Create structured learning assets from notes."],
          ["Visual preview", "Inspect diagrams, cards, and learning blocks."],
          ["Student workflow", "Move from upload to revision without context switching."],
        ].map(([title, description], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
          >
            <Sparkles className="mb-4 h-5 w-5 text-cyan-300" />

            <h2 className="text-base font-semibold text-white">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}