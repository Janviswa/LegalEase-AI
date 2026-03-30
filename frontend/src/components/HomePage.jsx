import {
  Zap, Shield, BookOpen, BarChart2, Download,
  TrendingUp, Scale, ArrowRight, FileText,
  Sparkles, CheckCircle, Upload, FileEdit, Send, PenLine, LayoutTemplate
} from "lucide-react";
import { DARK, LIGHT } from "../theme.js";

const FEATURES = [
  { icon: Zap,        label: "Instant AI Analysis",    desc: "Full breakdown in under 30 seconds — powered by Groq LLaMA 3.1.", color: "#4f6ef7", darkBg: "#0d1233", lightBg: "#eef0ff" },
  { icon: Shield,     label: "Risk Detection",          desc: "Flags hidden traps — one-sided clauses, unreasonable penalties, unfair termination.", color: "#ef4444", darkBg: "#1f0d0d", lightBg: "#fff0f0" },
  { icon: BookOpen,   label: "Plain-English Summaries", desc: "Every clause explained simply. No legal jargon. Know exactly what you're signing.", color: "#16a34a", darkBg: "#0e1f14", lightBg: "#f0fdf4" },
  { icon: BarChart2,  label: "Clause-by-Clause Score", desc: "Every clause rated Fair, Review, or Risk with a color-coded breakdown.", color: "#d97706", darkBg: "#1f1808", lightBg: "#fffbeb" },
  { icon: Download,   label: "Export PDF Report",       desc: "Download a professional report to share with your lawyer before signing.", color: "#7c3aed", darkBg: "#150e2a", lightBg: "#f5f3ff" },
  { icon: TrendingUp, label: "Negotiation Tips",        desc: "Know exactly which clauses to push back on and how to negotiate better terms.", color: "#0284c7", darkBg: "#0b1929", lightBg: "#eff6ff" },
];

const STEPS = [
  { n: "01", title: "Upload your document", desc: "Drag and drop any lease, rent agreement, or land deed — PDF, Word (.docx), or Text (.txt).", icon: Upload },
  { n: "02", title: "AI analyzes it",        desc: "Groq LLaMA 3.1 reads every clause, scores risk, and identifies legal terms.", icon: Sparkles },
  { n: "03", title: "Read the report",       desc: "Browse Summary, Pros & Cons, Legal Terms, and Clause Checker — all in plain English.", icon: FileText },
  { n: "04", title: "Act on insights",       desc: "Download the PDF report, share with your lawyer, and negotiate with confidence.", icon: CheckCircle },
];

const DOC_TYPES = [
  { icon: "🏠", label: "Residential Lease",      desc: "Rental agreements for houses and apartments" },
  { icon: "🏢", label: "Commercial Lease",       desc: "Office, shop, and warehouse rental contracts" },
  { icon: "🌾", label: "Land Deeds",             desc: "Sale deeds, gift deeds, and partition deeds" },
  { icon: "🏗️", label: "Development Agreements", desc: "JDA, builder-buyer, and construction contracts" },
  { icon: "📋", label: "Leave & License",        desc: "Short-term occupancy agreements" },
  { icon: "⚖️", label: "Sale Agreements",        desc: "Agreement to sell and MOU for property purchase" },
];

const STATS = [
  { value: "30s",  label: "Avg. analysis time"   },
  { value: "25+",  label: "Indian laws covered"  },
  { value: "5",    label: "Analysis dimensions"  },
  { value: "100%", label: "Private — no storage" },
];

const LAW_STATES = ["All India", "Tamil Nadu", "Karnataka", "Maharashtra", "Kerala", "Telangana", "West Bengal", "Delhi (NCT)", "Gujarat", "Rajasthan"];

export default function HomePage({ dark, user, onGoAnalyze, onGoLaws, onGoDrafts }) {
  const D = dark ? DARK : LIGHT;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: D.bg }}>

      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          minHeight: "calc(100vh - 54px)",
          background: dark
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, #0d1233 0%, #0d1117 60%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, #eef0ff 0%, #f6f8fa 60%)",
        }}>

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:"absolute", top:"10%", left:"15%", width:320, height:320, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(79,110,247,0.18), transparent 70%)", filter:"blur(40px)" }} />
          <div style={{ position:"absolute", top:"20%", right:"10%", width:260, height:260, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)", filter:"blur(40px)" }} />
          <div style={{ position:"absolute", bottom:"5%", left:"40%", width:200, height:200, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(79,110,247,0.12), transparent 70%)", filter:"blur(30px)" }} />
        </div>

        <div className="relative w-full max-w-3xl mx-auto px-6 py-10 text-center">

          {/* Welcome badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: dark ? "rgba(79,110,247,0.15)" : "rgba(79,110,247,0.08)", color:"#4f6ef7", border:"1px solid rgba(79,110,247,0.25)" }}>
            <Sparkles size={12} />
            Welcome back, {firstName}! 👋
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:"clamp(2rem,5vw,3.25rem)", fontWeight:800, lineHeight:1.15, color:D.text, marginBottom:"1.25rem", letterSpacing:"-0.02em" }}>
            Understand any property<br />
            <span style={{ background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              document in seconds
            </span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize:"1.05rem", color:D.textMuted, lineHeight:1.7, maxWidth:500, margin:"0 auto 2.5rem" }}>
            Upload a PDF, Word doc, or text file — get an instant AI breakdown
            with risk score, plain-English explanation, and negotiation tips.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginBottom:"2rem" }}>
            <button onClick={onGoAnalyze}
              className="flex items-center gap-2 font-bold text-white transition-all hover:opacity-90 active:scale-[.97]"
              style={{ padding:"0.85rem 2rem", borderRadius:14, fontSize:"0.9rem",
                background:"linear-gradient(135deg,#4f6ef7,#6d28d9)", boxShadow:"0 8px 28px rgba(79,110,247,.45)" }}>
              <Zap size={15} /> Analyze a Document <ArrowRight size={13} />
            </button>
            <button onClick={onGoDrafts}
              className="flex items-center gap-2 font-bold transition-all hover:opacity-80"
              style={{ padding:"0.85rem 2rem", borderRadius:14, fontSize:"0.9rem",
                color:D.text, background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)", border:`1px solid ${D.border}` }}>
              <FileEdit size={15} /> Draft a Document
            </button>
            <button onClick={onGoLaws}
              className="flex items-center gap-2 font-bold transition-all hover:opacity-80"
              style={{ padding:"0.85rem 2rem", borderRadius:14, fontSize:"0.9rem",
                color:D.text, background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)", border:`1px solid ${D.border}` }}>
              <Scale size={15} /> Browse Land Laws
            </button>
          </div>

          {/* Trust line */}
          <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color:D.textSubtle }}>
            <Shield size={11} />
            PDF · Word · TXT · Groq LLaMA 3.1 · History saved to your account
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════════ */}
      <div style={{ background:D.surface, borderTop:`1px solid ${D.border}`, borderBottom:`1px solid ${D.border}` }}>
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span style={{ fontSize:"1.75rem", fontWeight:800, color:"#4f6ef7", lineHeight:1 }}>{s.value}</span>
              <span style={{ fontSize:"0.72rem", color:D.textMuted, textAlign:"center" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4f6ef7", marginBottom:"0.5rem" }}>How it works</p>
          <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text }}>Four steps to a full analysis</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative flex flex-col items-center text-center px-4">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px"
                  style={{ background: dark ? "rgba(79,110,247,0.25)" : "rgba(79,110,247,0.2)" }} />
              )}
              <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", boxShadow:"0 4px 16px rgba(79,110,247,.35)" }}>
                <s.icon size={22} className="text-white" />
              </div>
              <span style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.08em", color:"#4f6ef7", marginBottom:"0.35rem" }}>{s.n}</span>
              <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:D.text, marginBottom:"0.5rem" }}>{s.title}</h3>
              <p style={{ fontSize:"0.76rem", lineHeight:1.6, color:D.textMuted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════ */}
      <section style={{ background:dark?"rgba(22,27,34,0.7)":"rgba(246,248,250,0.9)", borderTop:`1px solid ${D.border}`, borderBottom:`1px solid ${D.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4f6ef7", marginBottom:"0.5rem" }}>Features</p>
            <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text }}>Everything you need to understand a contract</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.label}
                className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background:D.surface, border:`1px solid ${D.border}`, boxShadow:dark?"0 2px 12px rgba(0,0,0,.2)":"0 2px 12px rgba(0,0,0,.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background:dark?f.darkBg:f.lightBg }}>
                  <f.icon size={17} style={{ color:f.color }} />
                </div>
                <h3 style={{ fontSize:"0.85rem", fontWeight:700, color:D.text, marginBottom:"0.4rem" }}>{f.label}</h3>
                <p style={{ fontSize:"0.76rem", lineHeight:1.6, color:D.textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════
          DRAFT STUDIO
      ════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4f6ef7", marginBottom:"0.5rem" }}>Draft Studio</p>
            <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text, marginBottom:"0.75rem" }}>Create legal documents from scratch</h2>
            <p style={{ fontSize:"0.85rem", color:D.textMuted, lineHeight:1.7, marginBottom:"1rem" }}>
              Don't have a document yet? Use our Draft Studio to generate legally formatted Indian property agreements in minutes — just fill in the details and download.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "11+ ready-to-use templates — lease, sale, deed, NDA, POA & more",
                "Auto-generates proper legal language for Indian law",
                "AI risk analysis built in — know your score before you sign",
                "E-sign workflow — send PDF directly to the other party",
                "Download as PDF, Word (.docx), or plain text",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2" style={{ fontSize:"0.82rem", color:D.textMuted }}>
                  <CheckCircle size={13} style={{ color:"#4f6ef7", flexShrink:0, marginTop:2 }} />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onGoDrafts}
              className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-all"
              style={{ padding:"0.7rem 1.5rem", borderRadius:12, fontSize:"0.85rem",
                background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", boxShadow:"0 4px 16px rgba(79,110,247,.35)" }}>
              <FileEdit size={14} /> Open Draft Studio <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex-shrink-0 w-full lg:w-72 grid grid-cols-2 gap-2">
            {[
              { icon:"🏠", label:"Residential Lease",  cat:"Lease"       },
              { icon:"🏢", label:"Commercial Lease",   cat:"Lease"       },
              { icon:"🔑", label:"Leave & License",    cat:"Lease"       },
              { icon:"📋", label:"Agreement to Sell",  cat:"Sale"        },
              { icon:"🎁", label:"Gift Deed",          cat:"Deed"        },
              { icon:"🏦", label:"Mortgage Deed",      cat:"Deed"        },
              { icon:"✍️", label:"Power of Attorney",  cat:"Authorization"},
              { icon:"🔒", label:"NDA",                cat:"NDA"         },
              { icon:"🏗️", label:"Joint Development",  cat:"Development" },
              { icon:"🤝", label:"Relinquishment",     cat:"Deed"        },
            ].map(d => (
              <div key={d.label}
                className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                style={{ background:D.surface, border:`1px solid ${D.border}` }}
                onClick={onGoDrafts}>
                <span style={{ fontSize:"1.1rem", lineHeight:1, flexShrink:0 }}>{d.icon}</span>
                <div>
                  <p style={{ fontSize:"0.72rem", fontWeight:700, color:D.text, lineHeight:1.2 }}>{d.label}</p>
                  <p style={{ fontSize:"0.64rem", color:D.textMuted }}>{d.cat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SUPPORTED DOCUMENTS
      ════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1">
            <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4f6ef7", marginBottom:"0.5rem" }}>Supported documents</p>
            <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text, marginBottom:"0.75rem" }}>Works with all Indian property documents</h2>
            <p style={{ fontSize:"0.85rem", color:D.textMuted, lineHeight:1.7, marginBottom:"0.75rem" }}>
              LegalEase AI is specifically built for Indian property document formats — residential, commercial, agricultural, and development agreements.
            </p>
            {/* Format badges */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {[
                { ext: "PDF",  color: "#ef4444", bg: dark ? "#2a0d0d" : "#fff0f0" },
                { ext: "DOCX", color: "#2563eb", bg: dark ? "#0b1929" : "#eff6ff" },
                { ext: "TXT",  color: "#16a34a", bg: dark ? "#0e1f14" : "#f0fdf4" },
              ].map(f => (
                <span key={f.ext}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: f.bg, color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.ext}
                </span>
              ))}
              <span style={{ fontSize:"0.75rem", color:D.textSubtle }}>up to 20 MB per file</span>
            </div>
            <button onClick={onGoAnalyze}
              className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-all"
              style={{ padding:"0.7rem 1.5rem", borderRadius:12, fontSize:"0.85rem",
                background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", boxShadow:"0 4px 16px rgba(79,110,247,.35)" }}>
              <Zap size={14} /> Try it now <ArrowRight size={13} />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {DOC_TYPES.map(d => (
              <div key={d.label}
                className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background:D.surface, border:`1px solid ${D.border}` }}>
                <span style={{ fontSize:"1.4rem", lineHeight:1, flexShrink:0 }}>{d.icon}</span>
                <div>
                  <p style={{ fontSize:"0.8rem", fontWeight:700, color:D.text, marginBottom:2 }}>{d.label}</p>
                  <p style={{ fontSize:"0.7rem", color:D.textMuted }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          LAWS SECTION HIGHLIGHT
      ════════════════════════════════════════════════════ */}
      <section style={{ background:dark?"rgba(13,18,51,0.5)":"rgba(238,240,255,0.6)", borderTop:`1px solid ${D.border}`, borderBottom:`1px solid ${D.border}` }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <p style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4f6ef7", marginBottom:"0.5rem" }}>Indian Land Laws</p>
              <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text, marginBottom:"0.75rem" }}>25+ Indian property laws, explained</h2>
              <p style={{ fontSize:"0.85rem", color:D.textMuted, lineHeight:1.7, marginBottom:"1.25rem" }}>
                Browse central laws and state-specific laws for all states and Union Territories.
                Each law includes expandable sections with real legal content — not just summaries.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "All India central laws — Transfer of Property Act, RERA, Stamp Act",
                  "State laws for Tamil Nadu, Karnataka, Maharashtra, Delhi & more",
                  "Expandable key sections with full legal explanations",
                  "Search, filter by category, and bookmark laws",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize:"0.82rem", color:D.textMuted }}>
                    <CheckCircle size={13} style={{ color:"#4f6ef7", flexShrink:0, marginTop:2 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGoLaws}
                className="inline-flex items-center gap-2 font-bold text-white hover:opacity-90 transition-all"
                style={{ padding:"0.7rem 1.5rem", borderRadius:12, fontSize:"0.85rem",
                  background:"linear-gradient(135deg,#4f6ef7,#7c3aed)" }}>
                <Scale size={14} /> Explore Laws <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex-shrink-0 w-full lg:w-72 grid grid-cols-2 gap-2">
              {LAW_STATES.map((state, i) => (
                <div key={state}
                  className="px-3 py-2.5 rounded-xl text-center cursor-pointer hover:opacity-80 transition-all"
                  style={{ background:D.surface, border:`1px solid ${i === 0 ? "#4f6ef7" : D.border}` }}
                  onClick={onGoLaws}>
                  <p style={{ fontSize:"0.75rem", fontWeight:600, color:i === 0 ? "#4f6ef7" : D.text }}>{state}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background:dark?"linear-gradient(135deg,#0d1233,#150e2a)":"linear-gradient(135deg,#eef0ff,#f5f3ff)", border:`1px solid ${dark?"#1a2550":"#c7d0ff"}` }}>

          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:400, height:200, borderRadius:"50%",
            background:"radial-gradient(ellipse, rgba(79,110,247,0.15), transparent 70%)", pointerEvents:"none" }} />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", boxShadow:"0 8px 28px rgba(79,110,247,.4)" }}>
              <Scale size={22} className="text-white" />
            </div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:D.text, marginBottom:"0.75rem" }}>
              Ready to analyze your document?
            </h2>
            <p style={{ fontSize:"0.88rem", color:D.textMuted, maxWidth:420, margin:"0 auto 2rem", lineHeight:1.7 }}>
              Upload a PDF, Word doc, or text file — get a full AI-powered analysis in under 30 seconds.
              No jargon, just clear risk flags and actionable insights.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={onGoAnalyze}
                className="inline-flex items-center gap-2.5 font-bold text-white hover:opacity-90 active:scale-[.97] transition-all"
                style={{ padding:"0.9rem 2.25rem", borderRadius:14, fontSize:"0.9rem",
                  background:"linear-gradient(135deg,#4f6ef7,#6d28d9)", boxShadow:"0 8px 28px rgba(79,110,247,.45)" }}>
                <Zap size={16} /> Analyze a Document <ArrowRight size={14} />
              </button>
              <button onClick={onGoDrafts}
                className="inline-flex items-center gap-2.5 font-bold hover:opacity-80 active:scale-[.97] transition-all"
                style={{ padding:"0.9rem 2.25rem", borderRadius:14, fontSize:"0.9rem",
                  color:D.text, background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)", border:`1px solid ${D.border}` }}>
                <FileEdit size={16} /> Draft a Document
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-6" style={{ borderTop:`1px solid ${D.border}` }}>
        <p style={{ fontSize:"0.72rem", color:D.textSubtle }}>
          LegalEase AI · Not a substitute for qualified legal advice · jananiviswa05@gmail.com
        </p>
      </div>

    </div>
  );
}
