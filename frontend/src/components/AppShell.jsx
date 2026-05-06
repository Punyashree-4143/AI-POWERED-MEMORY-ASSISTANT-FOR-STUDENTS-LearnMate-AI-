import { NavLink, Outlet } from "react-router-dom";
import {
  Bot,
  BrainCircuit,
  Code2,
  FileText,
  LayoutDashboard,
  Map,
  MessageSquare,
  PanelsTopLeft,
  Settings,
  Sparkles,
  UploadCloud,
  Images,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Notes", path: "/", icon: UploadCloud },
  { label: "Summaries", path: "/workspace/summaries", icon: FileText },
  { label: "Flashcards", path: "/workspace/flashcards", icon: PanelsTopLeft },
  { label: "Quizzes", path: "/workspace/quizzes", icon: HelpCircle },
  { label: "Mind Maps", path: "/workspace/mind-maps", icon: Map },
  { label: "Infographics", path: "/workspace/infographics", icon: Images },
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#070b1d] text-slate-100">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-24 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/[0.04] px-4 py-5 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3 px-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                LearnMate AI
              </p>
              <p className="text-xs text-slate-400">Study workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-white/12 text-white shadow-inner shadow-white/5"
                        : "text-slate-400 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
              <Bot className="h-4 w-4" />
              AI Study Mode
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Upload notes, clean OCR, then generate summaries, cards, quizzes,
              and visual explanations from the same learning source.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
