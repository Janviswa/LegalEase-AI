import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText, Cloud, Upload, Zap, Shield, Loader2, X, Cpu, Plus,
  Download, Copy, BookOpen, BarChart2, TrendingUp,
  CheckCircle, AlertTriangle, Scale, Check, AlertCircle, Sparkles, ChevronDown
} from "lucide-react";
import { DARK, LIGHT, API_BASE } from "../theme.js";
import { SkeletonCard, ResultCard, RiskBadge } from "./UI.jsx";

// ─── Parse Groq response → UI shape ──────────────────────────────────────────
// Groq returns: { simple_summary[], pros[], cons[], legal_terms_explained[] }
function parseGroqResponse(raw) {

  // ⭐ SUPPORT BOTH BACKEND STRUCTURES
  const summary =
    typeof raw.summary === "string"
      ? raw.summary
      : Array.isArray(raw.simple_summary)
        ? raw.simple_summary.join(" ")
        : "Analysis complete.";

  const pros = Array.isArray(raw.pros) ? raw.pros : [];
  const cons = Array.isArray(raw.cons) ? raw.cons : [];

  // ⭐ Support BOTH legal_terms formats
  let legal_terms = [];

  if (Array.isArray(raw.legal_terms)) {

    legal_terms = raw.legal_terms.map(item => {

      if (typeof item === "object" && item !== null) {
        return {
          section: item.section || "Not specifically defined in statute",
          term: item.term || "Legal Term",
          explanation: item.explanation || ""
        };
      }

      // If backend sends string "Term: explanation"
      if (typeof item === "string") {

        let separator = item.includes(":") ? ":" :
                        item.includes(" - ") ? " - " :
                        null;

        if (!separator) {
          return { term: item.trim(), explanation: "" };
        }

        const parts = item.split(separator);

        return {
          term: parts[0].trim(),
          explanation: parts.slice(1).join(separator).trim()
        };
      }

      return { term: "Legal Term", explanation: "" };
    });

  }
  else if (Array.isArray(raw.legal_terms_explained)) {

    legal_terms = raw.legal_terms_explained.map(str => {

      if (typeof str !== "string") {
        return { term: "Legal Term", explanation: "" };
      }

      let separator = str.includes(":") ? ":" :
                      str.includes(" - ") ? " - " :
                      null;

      if (!separator) {
        return { term: str.trim(), explanation: "" };
      }

      const parts = str.split(separator);

      return {
        term: parts[0].trim(),
        explanation: parts.slice(1).join(separator).trim()
      };
    });
  }

  // ⭐ Use backend risk score if exists
  const riskScore =
    typeof raw.risk_score === "number"
      ? raw.risk_score
      : 50;

  const riskLabel =
    raw.risk_level ||
    (riskScore >= 65 ? "High" :
    riskScore >= 35 ? "Medium" : "Low");

  const clauses = [
    ...pros.map(p => ({ title: truncate(p, 45), status: "ok", note: p })),
    ...cons.map(c => ({ title: truncate(c, 45), status: "risk", note: c })),
  ];

  // Parse suggestions from backend
  const suggestions = Array.isArray(raw.suggestions)
    ? raw.suggestions.map(s => ({
        original:    (typeof s === "object" && s.original)    || "",
        replacement: (typeof s === "object" && s.replacement) || "",
        reason:      (typeof s === "object" && s.reason)      || "",
        applied:     false,
      })).filter(s => s.original && s.replacement)
    : [];

  return { summary, riskScore, riskLabel, pros, cons, legal_terms, clauses, suggestions };
}

function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

// ─── Build plain-text report string for download ─────────────────────────────
function buildReportText(result, fileName) {
  const line = (n = 60) => "─".repeat(n);
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  let out = [];
  out.push("LEGALEASE AI — DOCUMENT ANALYSIS REPORT");
  out.push(line());
  out.push(`File       : ${fileName}`);
  out.push(`Analyzed   : ${date}`);
  out.push(`Risk Score : ${result.riskScore}/100  (${result.riskLabel} Risk)`);
  out.push(line());

  out.push("\n1. SUMMARY");
  out.push(line(40));
  out.push(result.summary);

  out.push("\n2. FAVORABLE CLAUSES");
  out.push(line(40));
  result.pros.forEach((p, i) => out.push(`  ${i + 1}. ${p}`));
  if (!result.pros.length) out.push("  None detected.");

  out.push("\n3. RISKS & RED FLAGS");
  out.push(line(40));
  result.cons.forEach((c, i) => out.push(`  ${i + 1}. ${c}`));
  if (!result.cons.length) out.push("  None detected.");

  out.push("\n4. LEGAL TERMS EXPLAINED");
  out.push(line(40));
  result.legal_terms.forEach((t, i) =>
    out.push(`  ${i + 1}. ${t.term}\n     ${t.explanation}`)
  );
  if (!result.legal_terms.length) out.push("  None detected.");

  out.push("\n5. CLAUSE-BY-CLAUSE REPORT");
  out.push(line(40));
  result.clauses.forEach((c, i) => {
    const status = c.status === "ok" ? "✓ FAIR" : c.status === "warn" ? "⚠ REVIEW" : "✗ RISK";
    out.push(`  ${i + 1}. [${status}]  ${c.title}`);
    out.push(`       ${c.note}`);
  });

  out.push("\n" + line());
  out.push("⚠ This report is AI-generated and not a substitute for qualified legal advice.");
  out.push("  LegalEase AI — jananiviswa05@gmail.com");
  out.push(line());

  return out.join("\n");
}

// ─── Download helper ─────────────────────────────────────────────────────────
function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── AnalyzePage ─────────────────────────────────────────────────────────────
export default function AnalyzePage({ dark, toast, token, onAnalysisComplete, onDownload, user }) {
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [progress, setProgress]     = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [activeTab, setActiveTab]   = useState("Summary");
  const [error, setError]           = useState(null);
  const [analysisDate, setAnalysisDate] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [originalDocText, setOriginalDocText]       = useState("");
  const [modifiedDocText, setModifiedDocText]       = useState("");
  // Fix #10: truncation warning state
  const [truncationInfo, setTruncationInfo] = useState(null); // { originalChars, analyzedChars }
  const fileRef = useRef();
  const D = dark ? DARK : LIGHT;

  // ── Read AI preferences from localStorage ────────────────────────────────
  const getPrefs = () => {
    try {
      const key = `legalease_prefs_${user?.email || "guest"}`;
      const stored = localStorage.getItem(key);
      const p = stored ? JSON.parse(stored) : {};
      return {
        autoAnalyze: p.autoAnalyze ?? false,
        depth:       p.depth       ?? "Standard",
        notif:       p.notif       ?? true,
      };
    } catch { return { autoAnalyze: false, depth: "Standard", notif: true }; }
  };

  const STEPS = [
    "Reading document…",
    "Extracting clauses…",
    "Detecting risk factors…",
    "Simplifying legal terms…",
    "Generating report…",
  ];

  const TABS = ["Summary", "Pros & Cons", "Legal Terms", "Clause Checker", "Suggestions"];



  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (f) {
      const name = f.name.toLowerCase();
      const allowed = name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc") || name.endsWith(".txt");
      if (!allowed) {
        setError("Only PDF, Word (.docx), and text (.txt) files are supported.");
        return;
      }
      // Fix #7: client-side file size validation
      if (f.size > MAX_FILE_SIZE) {
        setError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 20 MB.`);
        return;
      }
      setFile(f); setResult(null); setError(null); setTruncationInfo(null);
      // Auto-analyze if preference is enabled
      if (getPrefs().autoAnalyze) {
        setTimeout(() => triggerAnalyze(f), 100);
      }
    }
  }, [token, onAnalysisComplete]); // eslint-disable-line

  // Core analysis function — accepts optional file argument (used by autoAnalyze)
  const triggerAnalyze = async (fileArg) => {
    const targetFile = fileArg || file;
    if (!targetFile) return;
    const { depth, notif } = getPrefs();

    setLoading(true); setResult(null); setError(null); setTruncationInfo(null);
    setProgress(0); setActiveTab("Summary");
    setAppliedSuggestions(new Set());
    setOriginalDocText("");
    setModifiedDocText("");
    let step = 0;
    setProgressLabel(STEPS[0]);

    const iv = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 10 + 3, 88);
        const s = Math.floor((next / 88) * (STEPS.length - 1));
        if (s !== step) { step = s; setProgressLabel(STEPS[s]); }
        return next;
      });
    }, 400);

    // Read file text for TXT files only — PDF/DOCX are handled by backend extraction
    let fileText = "";
    const fileName = targetFile.name.toLowerCase();
    if (fileName.endsWith(".txt")) {
      try { fileText = await targetFile.text(); } catch {}
    }
    // For PDF/DOCX we'll get the clean extracted text back from the backend response

    try {
      const fd = new FormData();
      fd.append("file", targetFile);
      const res = await fetch(
        `${API_BASE}/analyze-document?depth=${encodeURIComponent(depth)}`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: fd,
          signal: AbortSignal.timeout(60000),
        }
      );

      clearInterval(iv);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const raw = await res.json();
      if (raw.error) throw new Error(raw.error);

      // Use backend's clean extracted text (works for PDF/DOCX/TXT correctly)
      const cleanText = raw.extracted_text || fileText || "";

      const parsed = parseGroqResponse(raw);
      const now    = new Date();
      setAnalysisDate(now);
      setProgress(100); setProgressLabel("Done!");
      setOriginalDocText(cleanText);
      setModifiedDocText(cleanText);

      // Fix #10: set truncation warning if backend flagged it
      if (raw.was_truncated) {
        setTruncationInfo({
          originalChars: raw.original_char_count,
          analyzedChars: raw.analyzed_char_count,
        });
      }

      setTimeout(() => {
        setResult(parsed);
        setLoading(false);
        if (notif) toast("Analysis complete!", "success");
        if (onAnalysisComplete) {
          onAnalysisComplete({
            fileName:  targetFile.name,
            fileSize:  `${(targetFile.size / 1024).toFixed(1)} KB`,
            riskLabel: parsed.riskLabel,
            riskScore: parsed.riskScore,
            date:      now,
            result:    parsed,
            depth:     depth,   // Fix #6: pass depth for history badge
          });
        }
      }, 400);
    } catch (err) {
      clearInterval(iv);
      setLoading(false);
      const msg = err.name === "TimeoutError"
        ? "Request timed out. The backend may be offline."
        : err.message || "Analysis failed. Please try again.";
      setError(msg);
      if (notif) toast("Analysis failed.", "error");
    }
  };

  // Button click — uses current `file` state
  const handleAnalyze = () => triggerAnalyze(file);

  const handleCopy = () => {
    if (!result) return;
    const text = buildReportText(result, file?.name || "document");
    navigator.clipboard.writeText(text).then(
      () => toast("Report copied to clipboard!", "success"),
      () => toast("Copy failed — use Export instead.", "error")
    );
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const res = await fetch(`${API_BASE}/export-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(result),
      });

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "LegalEase_Report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

      toast("PDF report downloaded!", "success");

    } catch (e) {
      toast("PDF export failed.", "error");
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── LEFT: Upload Sidebar ── */}
      <div className="w-[340px] min-w-[280px] flex flex-col flex-shrink-0 overflow-y-auto"
        style={{ background: D.surface, borderRight: `1px solid ${D.border}` }}>
        <div className="p-5 flex flex-col gap-4 flex-1">

          <div>
            <h2 className="font-bold text-base" style={{ color: D.text }}>Upload Document</h2>
            <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>PDF · Word · TXT · up to 20 MB</p>
            {/* Active depth badge */}
            {(() => {
              const { depth } = getPrefs();
              const depthStyle = {
                Standard: { bg: dark ? "#0d1233" : "#eef0ff", color: "#4f6ef7" },
                Detailed:  { bg: dark ? "#1a0d2e" : "#faf5ff", color: "#a855f7" },
                Expert:    { bg: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e" },
              }[depth] || { bg: dark ? "#0d1233" : "#eef0ff", color: "#4f6ef7" };
              return (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: depthStyle.bg, color: depthStyle.color }}>
                  <Cpu size={9} /> {depth} Analysis
                </span>
              );
            })()}
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? "#4f6ef7" : D.border}`,
              background: dragging ? (dark ? "#0d1233" : "#eef1ff") : D.surfaceAlt,
              transform: dragging ? "scale(1.01)" : "scale(1)",
            }}
            className="flex flex-col items-center gap-3 py-8 px-5 rounded-2xl cursor-pointer transition-all duration-200">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: dragging ? "#1a2550" : dark ? "#1c2230" : "#e8ecf5", color: dragging ? "#4f6ef7" : D.textMuted }}>
              <Cloud size={26} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: D.text }}>Drop your document here</p>
              <p className="text-xs mt-1" style={{ color: D.textMuted }}>PDF · Word (.docx) · Text (.txt)</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
              style={{ background: dark ? "#1a2550" : "#e8eeff", color: "#4f6ef7" }}>
              <Upload size={11} /> Browse Files
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={onDrop} />
          </div>

          {/* File preview */}
          {file && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ background: D.surfaceAlt, borderColor: D.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: dark ? "#0d1233" : "#eef0ff" }}>
                <FileText size={15} style={{ color: "#4f6ef7" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: D.text }}>{file.name}</p>
                <p className="text-xs" style={{ color: D.textMuted }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => { setFile(null); setResult(null); setError(null); }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-500/20"
                style={{ color: D.textSubtle }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl p-3 border text-xs font-medium flex items-start gap-2"
              style={{ background: dark ? "#2a0d0d" : "#fff0f0", borderColor: dark ? "#4a1919" : "#fca5a5", color: dark ? "#f87171" : "#b91c1c" }}>
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: D.textMuted }}>
                  <Cpu size={11} style={{ color: "#4f6ef7" }} className="animate-pulse" />
                  {progressLabel}
                </span>
                <span className="text-xs font-bold" style={{ color: "#4f6ef7" }}>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: D.surfaceAlt }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4f6ef7, #7c3aed)" }} />
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button onClick={handleAnalyze} disabled={!file || loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[.98]"
            style={file && !loading
              ? { background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", boxShadow: "0 4px 24px rgba(79,110,247,.3)", cursor: "pointer" }
              : { background: dark ? "#1c2230" : "#e8ecf0", color: D.textSubtle, cursor: "not-allowed" }}>
            {loading ? <><Loader2 size={15} className="animate-spin" />Analyzing…</> : <><Zap size={15} />Analyze Document</>}
          </button>

          {/* New Analysis shortcut — shown in sidebar when a result is already displayed */}
          {result && (
            <button
              onClick={() => { setFile(null); setResult(null); setError(null); setTruncationInfo(null); setProgress(0); setProgressLabel(""); setActiveTab("Summary"); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80 active:scale-[.97]"
              style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a5c32" : "#86efac"}` }}>
              <Plus size={13} /> Analyze New Document
            </button>
          )}

          {/* What AI checks */}
          <div className="rounded-xl p-4 border" style={{ background: D.surfaceAlt, borderColor: D.borderLight }}>
            <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: D.textMuted }}>What AI Checks</p>
            <div className="space-y-2">
              {[
                ["Risk Clauses",    "#f87171"],
                ["Legal Jargon",    "#60a5fa"],
                ["Tenant Rights",   "#4ade80"],
                ["Payment Terms",   "#fbbf24"],
                ["Exit Conditions", "#a78bfa"],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs" style={{ color: D.textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-xl p-3.5 border" style={{ background: D.surfaceAlt, borderColor: D.borderLight }}>
            <div className="flex items-start gap-2">
              <Shield size={13} style={{ color: "#4f6ef7" }} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: D.textMuted }}>
                Documents processed in-memory only. Never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Results panel ── */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ background: D.bg }}>

        {/* Empty state — clean, upload-focused */}
        {!loading && !result && (
          <div className="flex-1 flex flex-col items-center justify-center px-8"
            style={{ background: D.bg }}>
            <div className="text-center" style={{ maxWidth: 420 }}>
              {/* Icon */}
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{ background: dark ? "#1c2230" : "#eef0ff", border: `2px dashed ${dark ? "#2d3348" : "#c7d0ff"}` }}>
                <Cloud size={28} style={{ color: dark ? "#4f6ef7" : "#4f6ef7", opacity: 0.7 }} />
              </div>

              {/* Text */}
              <h2 className="text-xl font-bold mb-2" style={{ color: D.text }}>
                Ready to analyze a document
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: D.textMuted }}>
                Select a PDF from the panel on the left and click <strong style={{ color: D.text }}>Analyze Document</strong> to get an instant AI risk report.
              </p>

              {/* What you get */}
              <div className="space-y-3 text-left">
                {[
                  { icon: Zap,       color: "#4f6ef7", label: "Risk score", desc: "0–100 risk rating with High / Medium / Low verdict" },
                  { icon: Shield,    color: "#ef4444", label: "Red flags",  desc: "Every risky or one-sided clause flagged clearly" },
                  { icon: BookOpen,  color: "#16a34a", label: "Plain English", desc: "Full summary with no legal jargon" },
                  { icon: BarChart2, color: "#d97706", label: "Clause checker", desc: "Every clause rated Fair, Review, or Risk" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: D.surface, border: `1px solid ${D.border}` }}>
                    <item.icon size={15} style={{ color: item.color, flexShrink: 0 }} />
                    <div>
                      <span className="text-xs font-bold" style={{ color: D.text }}>{item.label} </span>
                      <span className="text-xs" style={{ color: D.textMuted }}>— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs mt-6" style={{ color: D.textSubtle }}>
                PDF · Word (.docx) · Text (.txt) · up to 20 MB · Powered by Groq LLaMA 3.1
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4f6ef7" }} />
              <span className="text-xs" style={{ color: D.textMuted }}>Groq AI is analyzing your document…</span>
            </div>
            <SkeletonCard dark={dark} />
            <SkeletonCard dark={dark} />
            <SkeletonCard dark={dark} />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Result header bar */}
            <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
              style={{ background: D.surface, borderBottom: `1px solid ${D.border}` }}>
              <div className="flex items-center gap-4">
                {/* Risk gauge */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke={dark ? "#1c2230" : "#e8ecf0"} strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none"
                        stroke={result.riskLabel === "Low" ? "#4ade80" : result.riskLabel === "Medium" ? "#fbbf24" : "#f87171"}
                        strokeWidth="4"
                        strokeDasharray={`${(result.riskScore / 100) * 87.96} 87.96`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s ease" }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ color: D.text }}>{result.riskScore}</span>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: D.textMuted }}>Risk Score</p>
                    <RiskBadge risk={result.riskLabel} dark={dark} />
                  </div>
                </div>
                <div className="h-7 w-px" style={{ background: D.border }} />
                <div>
                  <p className="text-sm font-bold truncate max-w-[220px]" style={{ color: D.text }}>{file?.name}</p>
                  <p className="text-xs" style={{ color: D.textMuted }}>
                    Analyzed by Groq · {analysisDate?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Analyze New Document button — resets everything for a fresh upload */}
                <button
                  onClick={() => { setFile(null); setResult(null); setError(null); setTruncationInfo(null); setProgress(0); setProgressLabel(""); setActiveTab("Summary"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-all active:scale-[.97]"
                  style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a5c32" : "#86efac"}` }}>
                  <Plus size={11} /> New Analysis
                </button>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: D.surfaceAlt, color: D.textMuted, border: `1px solid ${D.border}` }}>
                  <Copy size={11} /> Copy
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[.97]"
                  style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", color: "#fff", boxShadow: "0 2px 12px rgba(79,110,247,.3)" }}>
                  <Download size={11} /> Download Report
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 py-2.5 flex-shrink-0"
              style={{ background: D.surface, borderBottom: `1px solid ${D.border}` }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={activeTab === t ? { background: "#4f6ef7", color: "#fff" } : { color: D.textMuted, background: "transparent" }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80">
                  {t}
                  {t === "Suggestions" && result?.suggestions?.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{
                        background: activeTab === t ? "rgba(255,255,255,0.25)" : (dark ? "#3d1a6e" : "#f3e8ff"),
                        color: activeTab === t ? "#fff" : "#a855f7",
                      }}>
                      {result.suggestions.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Fix #10: truncation warning banner */}
            {truncationInfo && (
              <div className="flex items-start gap-2.5 px-6 py-3 flex-shrink-0"
                style={{ background: dark ? "#1f1508" : "#fffbeb", borderBottom: `1px solid ${dark ? "#3d2a0a" : "#fde68a"}` }}>
                <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs leading-relaxed" style={{ color: dark ? "#fbbf24" : "#92400e" }}>
                  <span className="font-bold">Partial analysis: </span>
                  Your document is {(truncationInfo.originalChars / 1000).toFixed(0)}k characters.
                  Only the first {(truncationInfo.analyzedChars / 1000).toFixed(0)}k characters were analyzed due to the <span className="font-bold">{(() => { const p = getPrefs(); return p.depth; })()}</span> depth limit.
                  Switch to <span className="font-bold">Expert</span> mode in Settings for a larger limit, or be aware clauses near the end of the document may not be covered.
                </p>
                <button onClick={() => setTruncationInfo(null)} className="ml-auto flex-shrink-0 hover:opacity-60" style={{ color: "#f59e0b" }}>
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Summary */}
              {activeTab === "Summary" && (
                <ResultCard title="AI Summary (Groq)" icon={FileText} delay={0} dark={dark}>
                  <p className="text-sm leading-relaxed" style={{ color: dark ? "#9ca9b8" : "#57606a" }}>{result.summary}</p>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: "Risk Level",   value: result.riskLabel,
                        icon: TrendingUp,
                        color: result.riskLabel === "Low" ? "#4ade80" : result.riskLabel === "Medium" ? "#fbbf24" : "#f87171" },
                      { label: "Good Clauses", value: result.clauses.filter(c => c.status === "ok").length,   icon: Shield,       color: "#60a5fa" },
                      { label: "Risk Clauses", value: result.clauses.filter(c => c.status === "risk").length, icon: AlertCircle, color: "#f87171" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3 text-center"
                        style={{ background: dark ? "#1c2230" : "#f0f2f5", border: `1px solid ${dark ? "#2d3348" : "#e0e4ea"}` }}>
                        <s.icon size={14} style={{ color: s.color, margin: "0 auto 6px" }} />
                        <p className="text-xs font-bold" style={{ color: dark ? "#e6edf3" : "#1c2128" }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: dark ? "#8b949e" : "#57606a" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* Pros & Cons */}
              {activeTab === "Pros & Cons" && (
                <>
                  <ResultCard title="Favorable Clauses" icon={CheckCircle} accent="green" delay={0} dark={dark}>
                    {result.pros.length === 0
                      ? <p className="text-sm" style={{ color: D.textMuted }}>No favorable clauses detected.</p>
                      : <ul className="space-y-3">
                          {result.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: dark ? "#0e2a1a" : "#dcfce7" }}>
                                <Check size={10} style={{ color: dark ? "#4ade80" : "#16a34a" }} />
                              </span>
                              <span className="text-sm" style={{ color: dark ? "#9ca9b8" : "#57606a" }}>{p}</span>
                            </li>
                          ))}
                        </ul>}
                  </ResultCard>
                  <ResultCard title="Risks & Red Flags" icon={AlertTriangle} accent="red" delay={100} dark={dark}>
                    {result.cons.length === 0
                      ? <p className="text-sm" style={{ color: D.textMuted }}>No red flags detected.</p>
                      : <ul className="space-y-3">
                          {result.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: dark ? "#2a0d0d" : "#fee2e2" }}>
                                <AlertCircle size={10} style={{ color: dark ? "#f87171" : "#dc2626" }} />
                              </span>
                              <span className="text-sm" style={{ color: dark ? "#9ca9b8" : "#57606a" }}>{c}</span>
                            </li>
                          ))}
                        </ul>}
                  </ResultCard>
                </>
              )}

              {/* Legal Terms */}
              {activeTab === "Legal Terms" && (
                <ResultCard title="Legal Terms Explained" icon={Scale} accent="blue" delay={0} dark={dark}>
                  {result.legal_terms.length === 0
                    ? <p className="text-sm" style={{ color: D.textMuted }}>No legal terms found.</p>
                    : <div className="space-y-3">
                        {result.legal_terms.map((item, i) => (
                          <div key={i} className="rounded-xl p-4 border"
                            style={{ background: dark ? "#1c2230" : "#f6f8fa", borderColor: dark ? "#2d3348" : "#d0d7de" }}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4f6ef7" }} />
                              <p className="text-xs font-bold" style={{ color: "#4f6ef7" }}>
                              {item.section ? `${item.section} — ${item.term}` : item.term}
                              </p>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: dark ? "#8b949e" : "#57606a" }}>{item.explanation}</p>
                          </div>
                        ))}
                      </div>}
                </ResultCard>
              )}

              {/* Clause Checker */}
              {activeTab === "Clause Checker" && (
                <ResultCard title="Clause-by-Clause Report" icon={BarChart2} accent="amber" delay={0} dark={dark}>
                  {result.clauses.length === 0
                    ? <p className="text-sm" style={{ color: D.textMuted }}>No clauses to report.</p>
                    : <div className="space-y-2.5">
                        {result.clauses.map((c, i) => {
                          const colors = dark
                            ? { ok: ["#4ade80","#0e2a1a","#1a4731"], warn: ["#fbbf24","#1f1508","#4a3210"], risk: ["#f87171","#2a0d0d","#4a1919"] }
                            : { ok: ["#15803d","#dcfce7","#86efac"], warn: ["#a16207","#fef9c3","#fde047"], risk: ["#b91c1c","#fee2e2","#fca5a5"] };
                          const [clr, bg, border] = colors[c.status] || colors.ok;
                          return (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border"
                              style={{ background: dark ? "#1c2230" : "#f6f8fa", borderColor: dark ? "#2d3348" : "#d0d7de" }}>
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{ background: clr, boxShadow: `0 0 6px ${clr}` }} />
                                <div>
                                  <p className="text-xs font-semibold" style={{ color: dark ? "#e6edf3" : "#1c2128" }}>{c.title}</p>
                                  <p className="text-xs" style={{ color: dark ? "#8b949e" : "#57606a" }}>{c.note}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0"
                                style={{ color: clr, background: bg, borderColor: border }}>
                                {c.status === "ok" ? "Fair" : c.status === "warn" ? "Review" : "Risk"}
                              </span>
                            </div>
                          );
                        })}
                      </div>}
                </ResultCard>
              )}

              {/* ── Suggestions Tab ── */}
              {activeTab === "Suggestions" && (
                <ResultCard title="AI Suggestions — Reduce Risk" icon={Sparkles} accent="purple" delay={0} dark={dark}>
                  {/* Header note */}
                  <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl"
                    style={{ background: dark ? "#1a0d2e" : "#faf5ff", border: `1px solid ${dark ? "#3d1a6e" : "#e9d5ff"}` }}>
                    <Sparkles size={13} style={{ color: "#a855f7", flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs leading-relaxed" style={{ color: dark ? "#c084fc" : "#7e22ce" }}>
                      AI found the following clauses that can be improved to reduce risk. Click <strong>Apply Change</strong> to update the text directly in your document view.
                    </p>
                  </div>

                  {(!result.suggestions || result.suggestions.length === 0) ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: dark ? "#0e2a1a" : "#dcfce7" }}>
                        <CheckCircle size={22} style={{ color: "#22c55e" }} />
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: dark ? "#e6edf3" : "#1c2128" }}>No Changes Needed</p>
                      <p className="text-xs" style={{ color: D.textMuted }}>This document appears to have well-balanced clauses. No high-risk suggestions detected.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.suggestions.map((s, i) => {
                        const isApplied = appliedSuggestions.has(i);
                        return (
                          <div key={i}
                            className="rounded-xl border overflow-hidden transition-all duration-300"
                            style={{
                              borderColor: isApplied
                                ? (dark ? "#1a4731" : "#86efac")
                                : (dark ? "#2d3348" : "#d0d7de"),
                              background: isApplied
                                ? (dark ? "#0a1f14" : "#f0fdf4")
                                : (dark ? "#1c2230" : "#f6f8fa"),
                            }}>

                            {/* Suggestion number header */}
                            <div className="flex items-center justify-between px-4 py-2.5"
                              style={{
                                background: isApplied
                                  ? (dark ? "#0e2a1a" : "#dcfce7")
                                  : (dark ? "#161b22" : "#f0f2f5"),
                                borderBottom: `1px solid ${isApplied ? (dark ? "#1a4731" : "#86efac") : (dark ? "#2d3348" : "#e0e4ea")}`,
                              }}>
                              <span className="text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: isApplied ? "#22c55e" : "#a855f7" }}>
                                {isApplied ? "✓ Applied" : `Suggestion ${i + 1}`}
                              </span>
                              {!isApplied && (
                                <button
                                  onClick={() => {
                                    // Apply the text replacement to the modified document
                                    setModifiedDocText(prev => {
                                      const updated = prev.includes(s.original)
                                        ? prev.replace(s.original, s.replacement)
                                        : prev + `\n\n[AMENDMENT ${i + 1}]\nOriginal: ${s.original}\nReplaced with: ${s.replacement}`;
                                      return updated;
                                    });
                                    setAppliedSuggestions(prev => new Set([...prev, i]));
                                    if (toast) toast(`Suggestion ${i + 1} applied to document`, "success");
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                                  style={{
                                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                                    color: "#fff",
                                    boxShadow: "0 2px 8px rgba(168,85,247,0.35)",
                                  }}
                                >
                                  <Check size={10} /> Apply Change
                                </button>
                              )}
                            </div>

                            <div className="p-4 space-y-3">
                              {/* Original clause */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                  style={{ color: dark ? "#8b949e" : "#57606a" }}>
                                  Original (Risky)
                                </p>
                                <div className="px-3 py-2 rounded-lg border-l-2"
                                  style={{
                                    background: dark ? "#2a0d0d" : "#fff0f0",
                                    borderLeftColor: "#f87171",
                                  }}>
                                  <p className="text-xs font-mono leading-relaxed"
                                    style={{
                                      color: dark ? "#f87171" : "#b91c1c",
                                      textDecoration: isApplied ? "line-through" : "none",
                                      opacity: isApplied ? 0.6 : 1,
                                    }}>
                                    {s.original}
                                  </p>
                                </div>
                              </div>

                              {/* Replacement */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                  style={{ color: dark ? "#8b949e" : "#57606a" }}>
                                  Suggested Replacement
                                </p>
                                <div className="px-3 py-2 rounded-lg border-l-2"
                                  style={{
                                    background: dark ? "#0a1f14" : "#f0fdf4",
                                    borderLeftColor: "#22c55e",
                                  }}>
                                  <p className="text-xs font-mono leading-relaxed"
                                    style={{ color: dark ? "#4ade80" : "#15803d" }}>
                                    {s.replacement}
                                  </p>
                                </div>
                              </div>

                              {/* Reason */}
                              <div className="flex items-start gap-2">
                                <AlertTriangle size={12} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                                <p className="text-xs leading-relaxed" style={{ color: dark ? "#8b949e" : "#57606a" }}>
                                  {s.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Download updated document */}
                      {appliedSuggestions.size > 0 && (
                        <div className="rounded-xl border overflow-hidden"
                          style={{ borderColor: dark ? "#1a4731" : "#86efac", background: dark ? "#0a1f14" : "#f0fdf4" }}>
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                              <p className="text-xs font-semibold" style={{ color: dark ? "#4ade80" : "#15803d" }}>
                                {appliedSuggestions.size} of {result.suggestions.length} suggestion{appliedSuggestions.size !== 1 ? "s" : ""} applied
                              </p>
                            </div>
                            <DownloadDropdown
                              dark={dark} D={D} file={file} token={token}
                              modifiedDocText={modifiedDocText}
                              appliedSuggestions={appliedSuggestions}
                              suggestions={result.suggestions}
                              toast={toast}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ResultCard>
              )}

              <div className="text-center text-xs py-3 rounded-xl border"
                style={{ color: dark ? "#484f58" : "#8c959f", borderColor: dark ? "#21273a" : "#e8ecf0", background: dark ? "#161b22" : "#f6f8fa" }}>
                ⚠️ AI-generated by Groq LLaMA 3.1 — not a substitute for qualified legal advice.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Download dropdown for updated document ──────────────────────────────────
function DownloadDropdown({ dark, D, file, token, modifiedDocText, appliedSuggestions, suggestions, toast }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState("");
  const [pos,  setPos]    = useState({ top: 0, left: 0, width: 0 });
  const btnRef            = useRef(null);
  const menuRef           = useRef(null);

  // Position the portal menu above the button
  const openMenu = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ bottom: window.innerHeight - r.top + 8, left: r.left, width: r.width });
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const baseName = file?.name?.replace(/\.[^.]+$/, "") || "document";

  const buildChangeLogText = () => {
    const applied = suggestions.filter((_, idx) => appliedSuggestions.has(idx));
    return [
      "LEGALEASE AI — UPDATED DOCUMENT WITH CHANGE LOG",
      "═".repeat(60),
      `File    : ${file?.name || "document"}`,
      `Changes : ${appliedSuggestions.size} applied`,
      `Date    : ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      "═".repeat(60),
      "\nCHANGES MADE:",
      "─".repeat(40),
      ...applied.map((s, n) => [
        `\nChange ${n + 1}:`,
        `  ORIGINAL:    ${s.original}`,
        `  REPLACED BY: ${s.replacement}`,
        `  REASON:      ${s.reason}`,
      ].join("\n")),
      "\n" + "═".repeat(60),
      "UPDATED DOCUMENT:",
      "─".repeat(40) + "\n",
      modifiedDocText,
    ].join("\n");
  };

  const OPTIONS = [
    {
      key: "pdf", icon: "📕", label: "PDF Document", color: "#ef4444",
      action: async () => {
        setBusy("pdf");
        try {
          const res = await fetch(`${API_BASE}/export-doc-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ title: `${baseName} (Updated)`, content: modifiedDocText }),
          });
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `${baseName}_updated.pdf`; a.click();
          URL.revokeObjectURL(url);
          if (toast) toast("Updated PDF downloaded!", "success");
        } catch { if (toast) toast("PDF export failed. Try Plain Text.", "error"); }
        setBusy(""); setOpen(false);
      },
    },
    {
      key: "docx", icon: "📘", label: "Word DOCX", color: "#2563eb",
      action: async () => {
        setBusy("docx");
        try {
          const res = await fetch(`${API_BASE}/export-doc-docx`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ title: `${baseName} (Updated)`, content: modifiedDocText }),
          });
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `${baseName}_updated.docx`; a.click();
          URL.revokeObjectURL(url);
          if (toast) toast("Updated DOCX downloaded!", "success");
        } catch { if (toast) toast("DOCX export failed. Try Plain Text.", "error"); }
        setBusy(""); setOpen(false);
      },
    },
    {
      key: "txt", icon: "📄", label: "Plain Text (.txt)", color: "#16a34a",
      action: () => {
        const blob = new Blob([modifiedDocText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${baseName}_updated.txt`; a.click();
        URL.revokeObjectURL(url);
        if (toast) toast("Updated TXT downloaded!", "success");
        setOpen(false);
      },
    },
    {
      key: "log", icon: "📋", label: "With Change Log (.txt)", color: "#a855f7",
      action: () => {
        const blob = new Blob([buildChangeLogText()], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${baseName}_changes.txt`; a.click();
        URL.revokeObjectURL(url);
        if (toast) toast("Change log downloaded!", "success");
        setOpen(false);
      },
    },
  ];

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        bottom: pos.bottom,
        left: pos.left,
        minWidth: 210,
        zIndex: 99999,
        background: dark ? "#161b22" : "#ffffff",
        border: `1px solid ${dark ? "#2d3348" : "#d0d7de"}`,
        borderRadius: 12,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
        animation: "dropUp .18s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <div style={{
        padding: "8px 12px 6px",
        borderBottom: `1px solid ${dark ? "#2d3348" : "#e8ecf0"}`,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: dark ? "#484f58" : "#8c959f",
      }}>
        Choose format
      </div>
      {OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={opt.action}
          disabled={!!busy}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", background: "transparent", border: "none",
            cursor: busy ? "not-allowed" : "pointer", opacity: busy && busy !== opt.key ? 0.5 : 1,
            fontSize: 12, fontWeight: 500, color: dark ? "#8b949e" : "#57606a",
            transition: "background .15s, color .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = dark ? "#1c2230" : "#f6f8fa";
            e.currentTarget.style.color = dark ? "#e6edf3" : "#1c2128";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = dark ? "#8b949e" : "#57606a";
          }}
        >
          {busy === opt.key
            ? <Loader2 size={14} className="animate-spin" style={{ color: opt.color, flexShrink: 0 }} />
            : <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{opt.icon}</span>
          }
          <span style={{ flex: 1, textAlign: "left" }}>{opt.label}</span>
          {busy !== opt.key && <Download size={11} style={{ color: opt.color, flexShrink: 0 }} />}
        </button>
      ))}
      <style>{`
        @keyframes dropUp {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openMenu()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff",
          boxShadow: "0 2px 10px rgba(34,197,94,0.35)",
        }}
      >
        <Download size={11} />
        Download Updated
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />
      </button>
      {menu}
    </>
  );
}