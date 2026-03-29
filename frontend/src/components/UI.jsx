import { useState, useEffect } from "react";
import { Check, AlertCircle, Info } from "lucide-react";
import { DARK, LIGHT, cx } from "../theme.js";

// ─── Toast Hook ───────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, show };
}

export function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          style={{ animation: "toastIn .35s cubic-bezier(.16,1,.3,1) forwards" }}
          className={cx(
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-2xl border backdrop-blur-xl pointer-events-auto",
            t.type === "success" ? "bg-[#0f2a1e] border-[#1a4731] text-emerald-300"
              : t.type === "error" ? "bg-[#2a0f0f] border-[#4a1919] text-red-300"
              : "bg-[#1a1f2e] border-[#2d3348] text-blue-200"
          )}>
          {t.type === "success" ? <Check size={14} className="text-emerald-400" />
            : t.type === "error" ? <AlertCircle size={14} className="text-red-400" />
            : <Info size={14} className="text-blue-400" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = "?", size = "sm" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "lg" ? "w-11 h-11 text-sm"
           : size === "md" ? "w-9 h-9 text-xs"
           : "w-7 h-7 text-xs";
  return (
    <div className={cx("rounded-xl bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] flex items-center justify-center font-bold text-white flex-shrink-0 select-none", sz)}>
      {initials}
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
export function RiskBadge({ risk, dark }) {
  const map = dark
    ? { Low: ["#0e2a1a","#1a5c32","#4ade80"], Medium: ["#2a1e08","#7a4d0a","#fbbf24"], High: ["#2a0d0d","#7a1c1c","#f87171"] }
    : { Low: ["#dcfce7","#86efac","#15803d"], Medium: ["#fef9c3","#fde047","#a16207"], High: ["#fee2e2","#fca5a5","#b91c1c"] };
  const [bg, border, text] = map[risk] || map.Medium;
  return (
    <span style={{ background: bg, borderColor: border, color: text }}
      className="px-2.5 py-0.5 rounded-full text-xs font-bold border">
      {risk} Risk
    </span>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ on, setOn }) {
  return (
    <button onClick={() => setOn(!on)}
      style={{ background: on ? "#4f6ef7" : "#c1c9d6", width: 42, height: 24 }}
      className="relative rounded-full transition-colors duration-200 flex-shrink-0">
      <span className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all duration-200"
        style={{ left: on ? 21 : 3 }} />
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ h = "h-4", w = "w-full", className, dark }) {
  return (
    <div className={cx("rounded-lg animate-pulse", h, w, className)}
      style={{ background: dark ? "#21273a" : "#e2e6ea" }} />
  );
}

export function SkeletonCard({ dark }) {
  const D = dark ? DARK : LIGHT;
  return (
    <div className="rounded-2xl p-5 border" style={{ background: D.surface, borderColor: D.border }}>
      <div className="flex items-center gap-3 mb-5">
        <Skeleton h="h-9" w="w-9" className="rounded-xl" dark={dark} />
        <Skeleton h="h-4" w="w-32" dark={dark} />
      </div>
      <div className="space-y-2.5">
        <Skeleton h="h-3" dark={dark} />
        <Skeleton h="h-3" w="w-5/6" dark={dark} />
        <Skeleton h="h-3" w="w-3/4" dark={dark} />
        <Skeleton h="h-3" w="w-4/5" dark={dark} />
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
export function ResultCard({ title, icon: Icon, accent = "default", children, delay = 0, dark }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);

  const accents = dark ? {
    green:   { border: "#1a4731", bg: "linear-gradient(135deg, #0a1f14 0%, #161b22 100%)", icon: "#4ade80", iconBg: "#0e2a1a" },
    red:     { border: "#4a1919", bg: "linear-gradient(135deg, #1f0a0a 0%, #161b22 100%)", icon: "#f87171", iconBg: "#2a0d0d" },
    blue:    { border: "#1a2550", bg: "linear-gradient(135deg, #0a1229 0%, #161b22 100%)", icon: "#60a5fa", iconBg: "#0d1a33" },
    amber:   { border: "#4a3210", bg: "linear-gradient(135deg, #1f1508 0%, #161b22 100%)", icon: "#fbbf24", iconBg: "#2a1e08" },
    purple:  { border: "#3d1a6e", bg: "linear-gradient(135deg, #1a0a2e 0%, #161b22 100%)", icon: "#c084fc", iconBg: "#1a0d2e" },
    default: { border: "#2d3348", bg: "#161b22",  icon: "#8b949e", iconBg: "#1c2230" },
  } : {
    green:   { border: "#bbf7d0", bg: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", icon: "#16a34a", iconBg: "#dcfce7" },
    red:     { border: "#fecaca", bg: "linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)", icon: "#dc2626", iconBg: "#fee2e2" },
    blue:    { border: "#bfdbfe", bg: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", icon: "#2563eb", iconBg: "#dbeafe" },
    amber:   { border: "#fde68a", bg: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", icon: "#d97706", iconBg: "#fef3c7" },
    purple:  { border: "#e9d5ff", bg: "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)", icon: "#7e22ce", iconBg: "#f3e8ff" },
    default: { border: "#d0d7de", bg: "#ffffff",   icon: "#57606a", iconBg: "#f0f2f5" },
  };
  const a = accents[accent] || accents.default;

  return (
    <div style={{
      borderColor: a.border, background: a.bg,
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)",
      transition: `opacity .45s ease ${delay}ms, transform .45s ease ${delay}ms`,
    }} className="rounded-2xl p-5 border hover:-translate-y-1 hover:shadow-2xl cursor-default">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.iconBg }}>
          <Icon size={16} style={{ color: a.icon }} />
        </div>
        <h3 className="font-semibold text-sm" style={{ color: dark ? "#e6edf3" : "#1c2128" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}