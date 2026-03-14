"use client";

import { useState, useRef } from "react";
import {
  Sparkles, FileText, Target, Upload, X,
  CheckCircle, AlertCircle, Lightbulb, Shield, Star,
  ChevronDown, ChevronUp, Loader2, Zap, ClipboardList,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type ActiveTool = "coach" | "planner";

type ResumeResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  missing: string[];
  ats: string[];
};

// Update: Tipe data sekarang berbentuk array objek per hari
type PlannerDay = {
  day: number;
  tasks: string[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

// System prompts dipindah ke server (coach/route.ts & planner/route.ts)

// Update: Prompt untuk mengembalikan ARRAY langsung


// tool: "coach" | "planner" — masing-masing punya endpoint sendiri
async function callAI(tool: "coach" | "planner", userMessage: string): Promise<string> {
  const res = await fetch(`/api/ai/${tool}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  const data = await res.json() as { text?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.text ?? "";
}

function parseJSON<T>(raw: string): T {
  let clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  // Ambil JSON mulai dari { atau [ pertama
  const start = Math.min(
    clean.indexOf("{") === -1 ? Infinity : clean.indexOf("{"),
    clean.indexOf("[") === -1 ? Infinity : clean.indexOf("[")
  );
  if (start !== Infinity) {
    const isArr    = clean[start] === "[";
    const open     = isArr ? "[" : "{";
    const close    = isArr ? "]" : "}";
    let depth = 0, end = -1;
    for (let i = start; i < clean.length; i++) {
      if (clean[i] === open)  depth++;
      if (clean[i] === close) { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end !== -1) clean = clean.slice(start, end + 1);
  }
  return JSON.parse(clean) as T;
}

// ── Score Ring ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;
  const color  = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={130} height={130} viewBox="0 0 130 130" className="-rotate-90">
        <circle cx={65} cy={65} r={radius} fill="none" stroke="#1e293b" strokeWidth={10} />
        <circle cx={65} cy={65} r={radius} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-white tabular-nums">{score}</span>
        <span className="text-xs text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ── Section Card ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, items, accent }: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  accent: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`rounded-2xl border ${accent} bg-slate-800/60 overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-slate-100 font-semibold text-sm">{title}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400">{items.length}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
      </button>
      {open && (
        <ul className="px-5 pb-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current opacity-60" style={{ color: "inherit" }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Career Coach Tab ───────────────────────────────────────────────────────

function CareerCoach() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult]         = useState<ResumeResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const fileRef                     = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target?.result as string ?? "");
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!resumeText.trim()) { setError("Paste or upload your resume text first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callAI("coach", `Analyze this resume:\n\n${resumeText}`);
      setResult(parseJSON<ResumeResult>(raw));
    } catch {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreLabel = !result ? "" : result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : "Needs Work";

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-100 font-semibold text-sm">Resume Text</h3>
          <div className="flex items-center gap-2">
            {resumeText && (
              <button onClick={() => setResumeText("")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors">
                <X size={14} />
              </button>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 text-xs font-medium transition-colors">
              <Upload size={12} /> Upload .txt
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
          </div>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={10}
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all font-mono"
        />
        {error && <p className="mt-2 text-red-400 text-xs flex items-center gap-1.5"><AlertCircle size={12} /> {error}</p>}
        <div className="flex justify-end mt-3">
          <button onClick={analyze} disabled={loading || !resumeText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:text-white text-white text-sm font-semibold transition-all">
            {loading ? <><Loader2 size={15} className="animate-spin" />Analyzing...</> : <><Sparkles size={15} />Analyze Resume</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
              <ScoreRing score={result.score} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Resume Score</p>
              <h2 className="text-white text-3xl font-extrabold tracking-tight">{scoreLabel}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SectionCard title="Strengths" icon={<Star size={15} className="text-emerald-400" />} items={result.strengths} accent="border-emerald-500/25" />
            <SectionCard title="Weaknesses" icon={<AlertCircle size={15} className="text-red-400" />} items={result.weaknesses} accent="border-red-500/25" />
            <SectionCard title="Improvements" icon={<Lightbulb size={15} className="text-amber-400" />} items={result.improvements} accent="border-amber-500/25" />
            <SectionCard title="Missing Elements" icon={<X size={15} className="text-violet-400" />} items={result.missing} accent="border-violet-500/25" />
            <SectionCard 
                    title="ATS Optimization" 
                    icon={<Shield size={15} className="text-cyan-400" />} 
                    items={result.ats} 
                    accent="border-cyan-500/25" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Task Planner Tab ───────────────────────────────────────────────────────

function TaskPlanner() {
  const [goal, setGoal]     = useState("");
  const [result, setResult] = useState<PlannerDay[] | null>(null); // Update: State adalah array
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const generate = async () => {
    if (!goal.trim()) { setError("Please enter your goal first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callAI("planner", `Goal: ${goal}`);
      setResult(parseJSON<PlannerDay[]>(raw)); // Update: Parsing ke array
    } catch {
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    const EXAMPLES = [
    "Belajar React dari nol dalam 1 minggu",
    "Persiapan technical interview Google",
    "Membuat portofolio website dalam 5 hari",
    "Belajar SQL untuk data analysis",
    ];

  const DAY_COLORS = [
    "from-indigo-500/20 border-indigo-500/30 text-indigo-300",
    "from-violet-500/20 border-violet-500/30 text-violet-300",
    "from-emerald-500/20 border-emerald-500/30 text-emerald-300",
    "from-amber-500/20 border-amber-500/30 text-amber-300",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="text-slate-100 font-semibold text-sm mb-3">What do you want to achieve?</h3>
        <div className="relative">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. Learn React in 14 days..."
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 pr-36 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          <button onClick={generate} disabled={loading || !goal.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-all">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLES.map((ex, i) => (
            <button
            key={i}
            onClick={() => setGoal(ex)}
            className="text-[10px] px-2 py-1 rounded-md bg-slate-700/40 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            >
            {ex}
            </button>
        ))}
        </div>
        {error && <p className="mt-2 text-red-400 text-xs flex items-center gap-1.5"><AlertCircle size={12} />{error}</p>}
      </div>

      {result && result.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <Target size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Goal</p>
              <p className="text-white font-bold text-base leading-tight">{goal}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-slate-700/60" />
            <div className="space-y-3">
              {result.map((dayPlan, i) => {
                const colors = DAY_COLORS[i % DAY_COLORS.length].split(" ");
                return (
                  <div key={dayPlan.day} className="flex gap-4">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${colors[0]} border ${colors[1]} flex items-center justify-center flex-shrink-0 z-10 shadow-lg`}>
                      <span className={`text-xs font-extrabold ${colors[2]}`}>{dayPlan.day}</span>
                    </div>
                    <div className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/70 transition-colors">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${colors[2]}`}>Day {dayPlan.day}</p>
                      <ul className="space-y-2">
                        {dayPlan.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                            <CheckCircle size={13} className={`mt-0.5 flex-shrink-0 ${colors[2]} opacity-70`} />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AiToolsClient() {
  const [active, setActive] = useState<ActiveTool>("coach");

  const TABS: { key: ActiveTool; label: string; icon: React.ReactNode; desc: string; accent: string }[] = [
    {
      key: "coach",
      label: "AI Career Coach",
      icon: <FileText size={18} />,
      desc: "Analyze your resume & get actionable feedback",
      accent: "indigo",
    },
    {
      key: "planner",
      label: "AI Task Planner",
      icon: <ClipboardList size={18} />,
      desc: "Turn any goal into a structured daily plan",
      accent: "violet",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">AI Tools</h1>
            <p className="text-slate-600 text-[10px] leading-tight">Powered by CareerOS AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={[
              "relative flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200",
              active === tab.key
                ? tab.accent === "indigo" ? "bg-indigo-500/15 border-indigo-500/40" : "bg-violet-500/15 border-violet-500/40"
                : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/70",
            ].join(" ")}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${active === tab.key ? "text-white" : "text-slate-400"}`}>
              {tab.icon}
            </div>
            <div>
              <p className="font-bold text-sm text-white">{tab.label}</p>
              <p className="text-slate-500 text-xs">{tab.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div key={active}>
        {active === "coach"   && <CareerCoach />}
        {active === "planner" && <TaskPlanner />}
      </div>
    </div>
  );
}