import { useState } from "react";
import {
  FileText, Search, Clock, AlertTriangle, Bookmark, FileSearch,
  Star, Trash2, Plus, FileSignature, CheckCircle, FilePlus2,
  Sparkles, Download, X, TrendingUp, TrendingDown,
  Shield, BookOpen, AlertCircle
} from "lucide-react";
import { DARK, LIGHT, API_BASE } from "../theme.js";
import { RiskBadge } from "./UI.jsx";

// ─── Right-Side Detail Panel ──────────────────────────────────────────────────
function DetailPanel({ item, type, dark, onClose, token }) {
  const D = dark ? DARK : LIGHT;
  const [downloading, setDownloading] = useState(false);
  if (!item) return null;

  const r = item.result || {};
  const summary     = r.summary     || item.summary     || "";
  const pros        = r.pros        || item.pros        || [];
  const cons        = r.cons        || item.cons        || [];
  const legal_terms = r.legal_terms || item.legal_terms || [];
  const clauses     = r.clauses     || item.clauses     || [];
  const riskScore   = r.riskScore   ?? item.riskScore;
  const riskLabel   = r.riskLabel   || item.risk || "—";
  const fairCount   = clauses.filter(c => c.status === "ok").length;
  const riskCount   = clauses.filter(c => c.status === "risk").length;
  const scoreColor  = riskScore >= 65 ? "#f87171" : riskScore >= 35 ? "#fbbf24" : "#4ade80";
  const isAnalysis  = type === "analysis";

  const downloadAnalysis = async () => {
    setDownloading(true);
    const payload = item.result || { riskScore, riskLabel, risk_score: riskScore, risk_level: riskLabel, summary, pros, cons, legal_terms, clauses };
    try {
      const res = await fetch(`${API_BASE}/export-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${item.name.replace(/\.[^.]+$/, "")}_LegalEase_Report.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("PDF export failed. Please try again."); }
    finally { setDownloading(false); }
  };

  const downloadDocument = async () => {
    setDownloading(true);
    const content = item.content || item.docContent || "";
    const title   = item.name.replace(/\.[^.]+$/, "");
    try {
      const res = await fetch(`${API_BASE}/export-doc-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${title}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("PDF export failed. Please try again."); }
    finally { setDownloading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: D.surface, borderLeft: `1px solid ${D.border}` }}>

      {/* Panel Header */}
      <div className="flex items-start justify-between px-4 py-3.5 border-b flex-shrink-0"
        style={{ background: D.surface, borderColor: D.border }}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: dark ? "#0d1233" : "#eef0ff" }}>
            {isAnalysis
              ? <FileText size={14} style={{ color: "#4f6ef7" }} />
              : <FileSignature size={14} style={{ color: "#4f6ef7" }} />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: D.text }}>{item.name}</p>
            <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: D.textMuted }}>
              <Clock size={8} />{item.date}{item.size && <> · {item.size}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <button
            onClick={isAnalysis ? downloadAnalysis : downloadDocument}
            disabled={downloading}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: dark ? "#0d1a33" : "#eef0ff", color: "#4f6ef7", border: `1px solid ${dark ? "#1a2e5a" : "#c7d0ff"}` }}>
            <Download size={10} />{downloading ? "Exporting…" : "Download PDF"}
          </button>
          <button onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ background: D.surfaceAlt, color: D.textMuted }}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isAnalysis ? (
          <>
            {/* Risk Card */}
            <div className="rounded-2xl p-3.5 border" style={{ background: D.surfaceAlt, borderColor: D.border }}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Risk Assessment</span>
                <RiskBadge risk={riskLabel} dark={dark} />
              </div>
              {riskScore !== undefined && (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: D.textMuted }}>Risk Score</span>
                    <span className="text-base font-bold" style={{ color: scoreColor }}>
                      {riskScore}<span className="text-[10px] font-normal" style={{ color: D.textMuted }}>/100</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: D.border }}>
                    <div className="h-full rounded-full" style={{ width: `${riskScore}%`, background: scoreColor }} />
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Fair Clauses", value: fairCount, color: "#4ade80", bg: dark ? "rgba(74,222,128,0.08)" : "#f0fdf4" },
                  { label: "Risk Clauses", value: riskCount, color: "#f87171", bg: dark ? "rgba(248,113,113,0.08)" : "#fff5f5" },
                  { label: "Legal Terms",  value: legal_terms.length, color: "#a855f7", bg: dark ? "rgba(168,85,247,0.08)" : "#faf5ff" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                    <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] leading-tight mt-0.5" style={{ color: D.textMuted }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {summary && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen size={11} style={{ color: "#4f6ef7" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Executive Summary</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: D.text }}>{summary}</p>
              </div>
            )}

            {pros.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={11} style={{ color: "#4ade80" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>
                    Favorable Clauses <span style={{ color: "#4ade80" }}>({pros.length})</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {pros.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl"
                      style={{ background: dark ? "rgba(74,222,128,0.07)" : "#f0fdf4", border: `1px solid ${dark ? "rgba(74,222,128,0.15)" : "#bbf7d0"}` }}>
                      <CheckCircle size={10} style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                      <p className="text-xs leading-relaxed" style={{ color: D.text }}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cons.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown size={11} style={{ color: "#f87171" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>
                    Risks & Red Flags <span style={{ color: "#f87171" }}>({cons.length})</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {cons.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl"
                      style={{ background: dark ? "rgba(248,113,113,0.07)" : "#fff5f5", border: `1px solid ${dark ? "rgba(248,113,113,0.15)" : "#fecaca"}` }}>
                      <AlertCircle size={10} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                      <p className="text-xs leading-relaxed" style={{ color: D.text }}>{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {legal_terms.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield size={11} style={{ color: "#a855f7" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>
                    Legal Terms <span style={{ color: "#a855f7" }}>({legal_terms.length})</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {legal_terms.map((t, i) => {
                    const isObj = typeof t === "object" && t !== null;
                    const section     = isObj ? (t.section || "") : "";
                    const termName    = isObj ? (t.term || "") : (typeof t === "string" ? t.split(":")[0] : "");
                    const explanation = isObj ? (t.explanation || "") : (typeof t === "string" ? t.split(":").slice(1).join(":").trim() : "");
                    return (
                      <div key={i} className="p-2.5 rounded-xl" style={{ background: D.surfaceAlt, border: `1px solid ${D.border}` }}>
                        {section && <p className="text-[9px] font-semibold mb-0.5 uppercase tracking-wide" style={{ color: D.textSubtle }}>{section}</p>}
                        <p className="text-[11px] font-bold mb-0.5" style={{ color: "#a855f7" }}>{termName}</p>
                        {explanation && <p className="text-[11px] leading-relaxed" style={{ color: D.textMuted }}>{explanation}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {clauses.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={11} style={{ color: "#4f6ef7" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Clause-by-Clause</span>
                </div>
                <div className="space-y-1.5">
                  {clauses.map((c, i) => {
                    const isFair = c.status === "ok";
                    const clr    = isFair ? "#4ade80" : "#f87171";
                    const bg     = isFair ? (dark ? "rgba(74,222,128,0.06)" : "#f0fdf4") : (dark ? "rgba(248,113,113,0.06)" : "#fff5f5");
                    const bdr    = isFair ? (dark ? "rgba(74,222,128,0.15)" : "#bbf7d0") : (dark ? "rgba(248,113,113,0.15)" : "#fecaca");
                    return (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-xl" style={{ background: bg, border: `1px solid ${bdr}` }}>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded mt-0.5 flex-shrink-0"
                          style={{ background: `${clr}22`, color: clr }}>{isFair ? "FAIR" : "RISK"}</span>
                        <p className="text-[11px] leading-relaxed" style={{ color: D.text }}>{c.note || c.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!summary && pros.length === 0 && cons.length === 0 && clauses.length === 0 && (
              <div className="text-center py-10">
                <FileSearch size={24} style={{ color: D.textSubtle, margin: "0 auto 8px" }} />
                <p className="text-xs font-medium" style={{ color: D.textMuted }}>No detailed analysis data stored.</p>
                <p className="text-[10px] mt-1" style={{ color: D.textSubtle }}>Re-analyze the document to see full results.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Document Details Card */}
            <div className="rounded-2xl p-3.5 border space-y-2.5" style={{ background: D.surfaceAlt, borderColor: D.border }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Document Details</p>
              {item.category && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: D.textMuted }}>Category</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: dark ? "#0d1233" : "#eef0ff", color: "#4f6ef7" }}>{item.category}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: D.textMuted }}>Status</span>
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={item.signStatus === "Sent for signing"
                    ? { background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e" }
                    : { background: dark ? "#1c2230" : "#f0f2f5", color: D.textMuted }}>
                  {item.signStatus === "Sent for signing"
                    ? <><CheckCircle size={9} /> Sent for Signing</>
                    : <><Clock size={9} /> Draft</>}
                </span>
              </div>
              {item.aiScore !== null && item.aiScore !== undefined && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: D.textMuted }}>AI Quality Score</span>
                    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "#a855f7" }}>
                      <Sparkles size={10} />{item.aiScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: D.border }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${item.aiScore}%`, background: "linear-gradient(90deg,#a855f7,#6d28d9)" }} />
                  </div>
                </>
              )}
            </div>

            {item.aiAnalysis && (
              <>
                {item.aiAnalysis.summary && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={11} style={{ color: "#a855f7" }} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>AI Summary</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: D.text }}>{item.aiAnalysis.summary}</p>
                  </div>
                )}
                {item.aiAnalysis.pros?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={11} style={{ color: "#4ade80" }} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Strengths ({item.aiAnalysis.pros.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {item.aiAnalysis.pros.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-xl"
                          style={{ background: dark ? "rgba(74,222,128,0.07)" : "#f0fdf4", border: `1px solid ${dark ? "rgba(74,222,128,0.15)" : "#bbf7d0"}` }}>
                          <CheckCircle size={10} style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                          <p className="text-xs leading-relaxed" style={{ color: D.text }}>{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {item.aiAnalysis.cons?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingDown size={11} style={{ color: "#f87171" }} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Risks ({item.aiAnalysis.cons.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {item.aiAnalysis.cons.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-xl"
                          style={{ background: dark ? "rgba(248,113,113,0.07)" : "#fff5f5", border: `1px solid ${dark ? "rgba(248,113,113,0.15)" : "#fecaca"}` }}>
                          <AlertCircle size={10} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                          <p className="text-xs leading-relaxed" style={{ color: D.text }}>{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {(item.content || item.docContent) && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={11} style={{ color: "#4f6ef7" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: D.textSubtle }}>Document Preview</span>
                </div>
                <div className="rounded-xl p-3 max-h-64 overflow-y-auto"
                  style={{ background: D.surfaceAlt, border: `1px solid ${D.border}` }}>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: D.textMuted, fontFamily: "inherit" }}>
                    {(item.content || item.docContent || "").slice(0, 2000)}
                    {(item.content || item.docContent || "").length > 2000 && "\n\n… (truncated)"}
                  </pre>
                </div>
              </div>
            )}

            {!item.content && !item.docContent && !item.aiAnalysis && (
              <div className="text-center py-8">
                <FilePlus2 size={22} style={{ color: D.textSubtle, margin: "0 auto 8px" }} />
                <p className="text-xs" style={{ color: D.textMuted }}>Document content not available for preview.</p>
                <p className="text-[10px] mt-1" style={{ color: D.textSubtle }}>Download the PDF to view the full document.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main HistoryPage ─────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function HistoryPage({ dark, history, setHistory, docHistory, setDocHistory, onGoAnalyze, onGoDocuments, token }) {
  const [tab, setTab]                   = useState("analysis");
  const [search, setSearch]             = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("analysis");
  // Fix #7: pagination state
  const [analysisPage, setAnalysisPage] = useState(1);
  const [docsPage,     setDocsPage]     = useState(1);
  const D = dark ? DARK : LIGHT;

  const openPanel  = (item, type) => { setSelectedItem(item); setSelectedType(type); };
  const closePanel = () => setSelectedItem(null);

  const filteredAnalysis = (history || []).filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );
  // Fix #7: paginate filtered list
  const totalAnalysisPages = Math.max(1, Math.ceil(filteredAnalysis.length / PAGE_SIZE));
  const pagedAnalysis = filteredAnalysis.slice((analysisPage - 1) * PAGE_SIZE, analysisPage * PAGE_SIZE);

  const toggleAnalysis = (id, field) =>
    setHistory(p => p.map(x => x.id === id ? { ...x, [field]: !x[field] } : x));
  const removeAnalysis = (id) => {
    setHistory(p => p.filter(x => x.id !== id));
    setSelectedItem(prev => (prev?.id === id ? null : prev));
  };

  const filteredDocs = (docHistory || []).filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );
  // Fix #7: paginate docs list
  const totalDocsPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const pagedDocs = filteredDocs.slice((docsPage - 1) * PAGE_SIZE, docsPage * PAGE_SIZE);
  const removeDoc     = (id) => {
    setDocHistory(p => p.filter(x => x.id !== id));
    setSelectedItem(prev => (prev?.id === id ? null : prev));
  };
  const toggleDocStar = (id) => setDocHistory(p => p.map(x => x.id === id ? { ...x, starred: !x.starred } : x));

  const downloadAnalysisDirect = async (item, e) => {
    e.stopPropagation();
    const resultData = item.result || {
      risk_score: item.riskScore, riskScore: item.riskScore,
      risk_level: item.risk, riskLabel: item.risk,
      summary: item.summary || "", pros: item.pros || [],
      cons: item.cons || [], legal_terms: item.legal_terms || [], clauses: item.clauses || [],
    };
    try {
      const res = await fetch(`${API_BASE}/export-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(resultData),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${item.name.replace(/\.[^.]+$/, "")}_LegalEase_Report.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("PDF export failed. Please try again."); }
  };

  const downloadDocDirect = async (doc, e) => {
    e.stopPropagation();
    const content = doc.content || doc.docContent || "";
    const title   = doc.name.replace(/\.[^.]+$/, "");
    try {
      const res = await fetch(`${API_BASE}/export-doc-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${title}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("PDF export failed. Please try again."); }
  };

  const analysisStats = [
    { label: "Total Analyzed", value: (history||[]).length,                                color: "#4f6ef7", darkBg: "#0d1233", lightBg: "#eef0ff", icon: FileText },
    { label: "High Risk Docs", value: (history||[]).filter(h => h.risk === "High").length, color: "#f87171", darkBg: "#2a0d0d", lightBg: "#fff0f0", icon: AlertTriangle },
    { label: "Bookmarked",     value: (history||[]).filter(h => h.starred).length,         color: "#fbbf24", darkBg: "#1f1508", lightBg: "#fffbeb", icon: Bookmark },
  ];

  const docStats = [
    { label: "Documents Created", value: (docHistory||[]).length,                                                        color: "#4f6ef7", darkBg: "#0d1233", lightBg: "#eef0ff", icon: FilePlus2 },
    { label: "Sent for Signing",  value: (docHistory||[]).filter(d => d.signStatus === "Sent for signing").length,       color: "#22c55e", darkBg: "#0e2a1a", lightBg: "#dcfce7", icon: FileSignature },
    { label: "AI Analysed",       value: (docHistory||[]).filter(d => d.aiScore !== null && d.aiScore !== undefined).length, color: "#a855f7", darkBg: "#1a0d2e", lightBg: "#faf5ff", icon: Sparkles },
  ];

  const CAT_COLORS = {
    "Lease": { bg: dark ? "#0d1a33" : "#eff6ff", text: "#60a5fa" },
    "Sale":  { bg: dark ? "#0e2a1a" : "#dcfce7", text: "#4ade80" },
    "Deed":  { bg: dark ? "#2a1e08" : "#fef3c7", text: "#fbbf24" },
    "NDA":   { bg: dark ? "#1a0d2e" : "#faf5ff", text: "#c084fc" },
  };

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: D.bg }}>

      {/* Left: List */}
      <div className="flex-1 overflow-y-auto p-6" style={{ minWidth: 0 }}>
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>History</h2>
              <p className="text-sm" style={{ color: D.textMuted }}>
                {tab === "analysis"
                  ? `${(history||[]).length} document${(history||[]).length !== 1 ? "s" : ""} analyzed`
                  : `${(docHistory||[]).length} document${(docHistory||[]).length !== 1 ? "s" : ""} created`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: D.surface, borderColor: D.border }}>
              <Search size={13} style={{ color: D.textSubtle }} />
              <input className="bg-transparent outline-none text-xs w-40" style={{ color: D.text }}
                placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setAnalysisPage(1); setDocsPage(1); }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl mb-6 w-fit"
            style={{ background: D.surfaceAlt, border: `1px solid ${D.border}` }}>
            {[
              { id: "analysis",  label: "Analysis History",  icon: FileSearch },
              { id: "documents", label: "Created Documents", icon: FilePlus2  },
            ].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setSelectedItem(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={tab === t.id
                  ? { background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff", boxShadow: "0 2px 8px rgba(79,110,247,.3)" }
                  : { color: D.textMuted, background: "transparent" }}>
                <t.icon size={13} />{t.label}
              </button>
            ))}
          </div>

          {/* ANALYSIS TAB */}
          {tab === "analysis" && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {analysisStats.map(s => (
                  <div key={s.label} className="rounded-2xl p-4 border" style={{ background: D.surface, borderColor: D.border }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: dark ? s.darkBg : s.lightBg }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: D.text }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {(history||[]).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: dark ? "#0d1233" : "#eef0ff" }}>
                    <FileSearch size={28} style={{ color: "#4f6ef7" }} />
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: D.text }}>No documents analyzed yet</p>
                  <p className="text-sm mb-5" style={{ color: D.textMuted }}>Upload a lease, deed, or any property agreement to get an instant AI risk report</p>
                  {/* Fix #11: show supported formats */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[["PDF", "#ef4444", dark?"#2a0d0d":"#fff0f0"], ["DOCX", "#2563eb", dark?"#0b1929":"#eff6ff"], ["TXT", "#16a34a", dark?"#0e1f14":"#f0fdf4"]].map(([label, color, bg]) => (
                      <span key={label} className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{ background: bg, color }}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <button onClick={onGoAnalyze}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-[.97] transition-all"
                    style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", boxShadow: "0 4px 16px rgba(79,110,247,.3)" }}>
                    <Plus size={14} /> Analyze a Document
                  </button>
                </div>
              ) : filteredAnalysis.length === 0 ? (
                <div className="text-center py-16">
                  <FileSearch size={28} style={{ color: D.textSubtle, margin: "0 auto 12px" }} />
                  <p className="text-sm" style={{ color: D.textMuted }}>No documents match "{search}"</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pagedAnalysis.map(h => {
                    const isSelected = selectedItem?.id === h.id;
                    const ext = h.name.split(".").pop()?.toLowerCase();
                    const fmt = ext === "pdf"  ? { label:"PDF",  color:"#ef4444", bg: dark?"#2a0d0d":"#fff0f0" }
                              : ext === "docx" || ext === "doc" ? { label:"WORD", color:"#2563eb", bg: dark?"#0b1929":"#eff6ff" }
                              : ext === "txt"  ? { label:"TXT",  color:"#16a34a", bg: dark?"#0e1f14":"#f0fdf4" }
                              : null;
                    return (
                      <div key={h.id}
                        className="group flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{
                          background: D.surface,
                          borderColor: isSelected ? "#4f6ef7" : D.border,
                          boxShadow: isSelected ? "0 0 0 1px #4f6ef7" : undefined,
                        }}
                        onClick={() => openPanel(h, "analysis")}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#4f6ef7"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = D.border; }}>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: dark ? "#0d1233" : "#eef0ff" }}>
                          <FileText size={17} style={{ color: "#4f6ef7" }} />
                        </div>

            <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: D.text }}>{h.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs flex items-center gap-1" style={{ color: D.textMuted }}>
                              <Clock size={9} />{h.date}
                            </span>
                            {h.size && <span className="text-xs" style={{ color: D.textSubtle }}>{h.size}</span>}
                            <span className="text-xs font-bold" style={{ color: "#4f6ef7" }}>Score: {h.riskScore}</span>
                            {/* Fix #6: show analysis depth if stored */}
                            {h.depth && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{
                                  background: h.depth === "Expert" ? (dark?"#0e2a1a":"#dcfce7") : h.depth === "Detailed" ? (dark?"#150e2a":"#f5f3ff") : (dark?"#0d1233":"#eef0ff"),
                                  color: h.depth === "Expert" ? "#22c55e" : h.depth === "Detailed" ? "#a855f7" : "#4f6ef7",
                                }}>{h.depth}</span>
                            )}
                            {fmt && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: fmt.bg, color: fmt.color }}>{fmt.label}</span>
                            )}
                          </div>
                        </div>

                        {/* Hover actions — opacity animated, occupy fixed space to prevent layout shift */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleAnalysis(h.id, "starred")}
                            title="Bookmark"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: h.starred?"#fbbf24":D.textSubtle, background: h.starred?(dark?"#1f1508":"#fef3c7"):"transparent" }}>
                            <Star size={13} fill={h.starred?"currentColor":"none"} />
                          </button>
                          <button onClick={(e) => downloadAnalysisDirect(h, e)}
                            title="Download PDF"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: D.textSubtle }}
                            onMouseEnter={e => { e.currentTarget.style.background=dark?"#0d1a33":"#eef0ff"; e.currentTarget.style.color="#4f6ef7"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=D.textSubtle; }}>
                            <Download size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeAnalysis(h.id); }}
                            title="Delete"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: D.textSubtle }}
                            onMouseEnter={e => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.background=dark?"#2a0d0d":"#fee2e2"; }}
                            onMouseLeave={e => { e.currentTarget.style.color=D.textSubtle; e.currentTarget.style.background="transparent"; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Risk badge — always last, always visible */}
                        <div className="flex-shrink-0 ml-1">
                          <RiskBadge risk={h.risk} dark={dark} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Fix #7: Pagination controls for analysis */}
              {totalAnalysisPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    onClick={() => setAnalysisPage(p => Math.max(1, p - 1))}
                    disabled={analysisPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: dark ? "#1c2230" : "#e8eeff", color: "#4f6ef7" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: totalAnalysisPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setAnalysisPage(n)}
                      className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                      style={n === analysisPage
                        ? { background: "#4f6ef7", color: "#fff" }
                        : { background: dark ? "#1c2230" : "#e8eeff", color: D.textMuted }}>
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setAnalysisPage(p => Math.min(totalAnalysisPages, p + 1))}
                    disabled={analysisPage === totalAnalysisPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: dark ? "#1c2230" : "#e8eeff", color: "#4f6ef7" }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* DOCUMENTS TAB */}
          {tab === "documents" && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {docStats.map(s => (
                  <div key={s.label} className="rounded-2xl p-4 border" style={{ background: D.surface, borderColor: D.border }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: dark ? s.darkBg : s.lightBg }}>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: D.text }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {(docHistory||[]).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: dark ? "#0d1233" : "#eef0ff" }}>
                    <FilePlus2 size={28} style={{ color: "#4f6ef7" }} />
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: D.text }}>No documents created yet</p>
                  <p className="text-sm mb-5" style={{ color: D.textMuted }}>Draft a legal document in seconds using AI-powered templates</p>
                  {/* Fix #12: show available template types */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-sm mx-auto">
                    {["🏠 Residential Lease", "🏢 Commercial Lease", "🤝 Sale Agreement", "📜 Sale Deed", "🔒 NDA", "✍️ Power of Attorney"].map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: dark ? "#1c2230" : "#f0f2f5", color: D.textMuted }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {onGoDocuments && (
                    <button onClick={onGoDocuments}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-[.97] transition-all"
                      style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", boxShadow: "0 4px 16px rgba(79,110,247,.3)" }}>
                      <FilePlus2 size={14} /> Open Draft Studio
                    </button>
                  )}
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="text-center py-16">
                  <FileSearch size={28} style={{ color: D.textSubtle, margin: "0 auto 12px" }} />
                  <p className="text-sm" style={{ color: D.textMuted }}>No documents match "{search}"</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pagedDocs.map(doc => {
                    const cc = CAT_COLORS[doc.category] || { bg: dark?"#0d1233":"#eef0ff", text:"#4f6ef7" };
                    const isSelected = selectedItem?.id === doc.id;
                    return (
                      <div key={doc.id}
                        className="group flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{
                          background: D.surface,
                          borderColor: isSelected ? "#4f6ef7" : D.border,
                          boxShadow: isSelected ? "0 0 0 1px #4f6ef7" : undefined,
                        }}
                        onClick={() => openPanel(doc, "document")}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#4f6ef7"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = D.border; }}>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cc.bg }}>
                          <FileSignature size={17} style={{ color: cc.text }} />
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: D.text }}>{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs flex items-center gap-1" style={{ color: D.textMuted }}>
                              <Clock size={9} />{doc.date}
                            </span>
                            {doc.category && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ background: cc.bg, color: cc.text }}>{doc.category}</span>
                            )}
                            {doc.aiScore !== null && doc.aiScore !== undefined && (
                              <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#a855f7" }}>
                                <Sparkles size={9} />AI: {doc.aiScore}/100
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleDocStar(doc.id)}
                            title="Bookmark"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: doc.starred?"#fbbf24":D.textSubtle, background: doc.starred?(dark?"#1f1508":"#fef3c7"):"transparent" }}>
                            <Star size={13} fill={doc.starred?"currentColor":"none"} />
                          </button>
                          <button onClick={(e) => downloadDocDirect(doc, e)}
                            title="Download PDF"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: D.textSubtle }}
                            onMouseEnter={e => { e.currentTarget.style.background=dark?"#0d1a33":"#eef0ff"; e.currentTarget.style.color="#4f6ef7"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=D.textSubtle; }}>
                            <Download size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                            title="Delete"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: D.textSubtle }}
                            onMouseEnter={e => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.background=dark?"#2a0d0d":"#fee2e2"; }}
                            onMouseLeave={e => { e.currentTarget.style.color=D.textSubtle; e.currentTarget.style.background="transparent"; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Status badge — always last */}
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ml-1"
                          style={doc.signStatus === "Sent for signing"
                            ? { background: dark?"#0e2a1a":"#dcfce7", color:"#22c55e" }
                            : { background: dark?"#1c2230":"#f0f2f5", color:D.textMuted }}>
                          {doc.signStatus === "Sent for signing"
                            ? <><CheckCircle size={9} /> Sent</>
                            : <><Clock size={9} /> Draft</>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Fix #7: Pagination controls for documents */}
              {totalDocsPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    onClick={() => setDocsPage(p => Math.max(1, p - 1))}
                    disabled={docsPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: dark ? "#1c2230" : "#e8eeff", color: "#4f6ef7" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: totalDocsPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setDocsPage(n)}
                      className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                      style={n === docsPage
                        ? { background: "#4f6ef7", color: "#fff" }
                        : { background: dark ? "#1c2230" : "#e8eeff", color: D.textMuted }}>
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setDocsPage(p => Math.min(totalDocsPages, p + 1))}
                    disabled={docsPage === totalDocsPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: dark ? "#1c2230" : "#e8eeff", color: "#4f6ef7" }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Right: Inline Detail Panel */}
      {selectedItem && (
        <div className="flex-shrink-0 overflow-hidden" style={{ width: "370px" }}>
          <DetailPanel
            item={selectedItem}
            type={selectedType}
            dark={dark}
            onClose={closePanel}
            token={token}
          />
        </div>
      )}
    </div>
  );
}