import { X, Sparkles, Zap, Shield, Globe, BarChart2, FileText, Bell, Download, Check, MessageCircle, FileEdit, Send, Sliders, User, Mail } from "lucide-react";
import { DARK, LIGHT, SUPPORT_EMAIL } from "../theme.js";

const CHANGELOG = [
  {
    version: "v3.0.0", date: "March 2025", badge: "Latest", badgeColor: "#4f6ef7",
    entries: [
      {
        icon: FileEdit, color: "#7c3aed", darkBg: "#150e2a", lightBg: "#f5f3ff",
        type: "New Feature",
        title: "Draft Studio",
        desc: "Create professional legal documents from scratch using AI-powered templates — Residential Lease, Commercial Lease, Sale Agreement, Sale Deed, Land Lease, JDA, NDA, Power of Attorney, and more. Fill in fields, add custom sections, drag to reorder, and download as PDF or DOCX.",
      },
      {
        icon: Send, color: "#0284c7", darkBg: "#0b1929", lightBg: "#eff6ff",
        type: "New Feature",
        title: "E-Signature Requests",
        desc: "Send any drafted document for signing directly from the Draft Studio. Enter the recipient's name and email — LegalEase AI emails them the document with a signing link and notifies you when the request is sent.",
      },
      {
        icon: Zap, color: "#4f6ef7", darkBg: "#0d1233", lightBg: "#eef0ff",
        type: "New Feature",
        title: "AI Draft Analysis",
        desc: "Before downloading or sending your drafted document, run a full AI risk assessment on it. Groq LLaMA 3.1 reviews every clause in your draft and returns a risk score, pros, cons, and clause-by-clause breakdown — so you catch problems before sharing.",
      },
      {
        icon: FileText, color: "#d97706", darkBg: "#1f1808", lightBg: "#fffbeb",
        type: "New Feature",
        title: "Export to DOCX",
        desc: "In addition to PDF, drafted documents can now be exported as Word (.docx) files. Use the DOCX option when you need to share an editable version of a document with a lawyer or co-signer.",
      },
    ],
  },
  {
    version: "v2.2.0", date: "March 2025", badge: null,
    entries: [
      {
        icon: MessageCircle, color: "#16a34a", darkBg: "#0e1f14", lightBg: "#f0fdf4",
        type: "New Feature",
        title: "Context-Aware AI Chat Widget",
        desc: "A floating chat assistant now appears on the Home, Analyzer, Drafts, and Laws pages. It knows what you're working on — the chat on the Analyzer page has full access to your uploaded document and analysis results, so you can ask natural questions like 'What clauses should I negotiate?' and get document-specific answers.",
      },
      {
        icon: Sliders, color: "#a855f7", darkBg: "#150e2a", lightBg: "#f5f3ff",
        type: "New Feature",
        title: "Analysis Depth Selector",
        desc: "Choose how thorough you want the AI review to be before analyzing: Standard (quick overview, top 5–8 clauses), Detailed (all significant clauses with section references), or Expert (exhaustive — every clause, negotiation leverage points, missing clauses, Indian law compliance flags).",
      },
    ],
  },
  {
    version: "v2.1.0", date: "February 2025", badge: null,
    entries: [
      {
        icon: Zap, color: "#4f6ef7", darkBg: "#0d1233", lightBg: "#eef0ff",
        type: "New Feature",
        title: "Live Groq AI Analysis",
        desc: "Documents are analyzed in real-time using Groq's LLaMA 3.1 model. Upload a PDF and get a full risk report — summary, pros/cons, legal terms, and clause scores — directly from your document content.",
      },
      {
        icon: Download, color: "#7c3aed", darkBg: "#150e2a", lightBg: "#f5f3ff",
        type: "New Feature",
        title: "Download Analysis Report as PDF",
        desc: "After any analysis you can download a complete PDF report with your risk score, summary, clause breakdown, and legal term explanations. Click 'Download Report' in the results header.",
      },
      {
        icon: Bell, color: "#a78bfa", darkBg: "#150e2a", lightBg: "#f5f3ff",
        type: "New Feature",
        title: "Action-Based Notifications",
        desc: "The notification panel shows real alerts from your actions — analysis completions with risk score, high-risk document warnings, report download confirmations, and sign request confirmations. Toggle notifications on or off in Settings.",
      },
      {
        icon: Shield, color: "#16a34a", darkBg: "#0e1f14", lightBg: "#f0fdf4",
        type: "Improvement",
        title: "Animated Risk Score Gauge",
        desc: "The result header now shows an animated SVG gauge with your document's computed risk score (0–100). Score is derived from the actual Groq output — weighted count of cons vs pros.",
      },
    ],
  },
  {
    version: "v2.0.0", date: "January 2025", badge: null,
    entries: [
      {
        icon: BarChart2, color: "#d97706", darkBg: "#1f1808", lightBg: "#fffbeb",
        type: "New Feature",
        title: "Clause-by-Clause Report",
        desc: "The Clause Checker tab breaks every clause from your document into Fair or Risk labels with explanatory notes — giving you a structured checklist before signing.",
      },
      {
        icon: Globe, color: "#0284c7", darkBg: "#0b1929", lightBg: "#eff6ff",
        type: "New Feature",
        title: "Multi-Jurisdiction Support",
        desc: "Analysis now supports India, USA, UK, and UAE legal frameworks. Set your jurisdiction in Settings → AI Preferences for region-specific clause interpretation.",
      },
      {
        icon: FileText, color: "#f87171", darkBg: "#2a0d0d", lightBg: "#fee2e2",
        type: "Improvement",
        title: "Light & Dark Mode",
        desc: "Fully redesigned dual-theme interface. Every component adapts properly to both themes — toggle with the sun/moon icon in the top navigation bar.",
      },
      {
        icon: User, color: "#6b7280", darkBg: "#1a1c22", lightBg: "#f3f4f6",
        type: "New Feature",
        title: "JWT Authentication",
        desc: "Secure account registration and login with JWT tokens. Your session persists across browser refreshes, and your history is tied to your account email.",
      },
    ],
  },
  {
    version: "v1.5.0", date: "December 2024", badge: null,
    entries: [
      {
        icon: Check, color: "#4ade80", darkBg: "#0e2a1a", lightBg: "#dcfce7",
        type: "Improvement",
        title: "Analysis History with Star & Search",
        desc: "Every document you analyze is automatically saved to the History tab with its risk score. Star important docs, search by name, delete old entries, and re-download reports from the detail panel.",
      },
      {
        icon: Sparkles, color: "#fbbf24", darkBg: "#1f1508", lightBg: "#fef3c7",
        type: "Improvement",
        title: "Real-Time Progress Tracking",
        desc: "A progress bar shows each step of the AI pipeline — reading, clause extraction, risk detection, legal terms, report generation — so you know exactly what's happening during analysis.",
      },
      {
        icon: Mail, color: "#60a5fa", darkBg: "#0b1929", lightBg: "#eff6ff",
        type: "New Feature",
        title: "Password Reset via Email",
        desc: "Forgot your password? Use the 'Forgot Password' link on the login screen. LegalEase AI emails a reset link to your registered address.",
      },
    ],
  },
];

export default function WhatsNewPage({ dark, onClose }) {
  const D = dark ? DARK : LIGHT;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: D.bg, border: `1px solid ${D.border}`,
          animation: "modalIn .3s cubic-bezier(.16,1,.3,1) forwards",
          width: "100%", maxWidth: 640, maxHeight: "88vh",
        }}
        className="rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: D.surface, borderBottom: `1px solid ${D.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)" }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: D.text }}>What's New</p>
              <p className="text-xs" style={{ color: D.textMuted }}>Latest features and improvements</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70"
            style={{ background: D.surfaceAlt, color: D.textMuted }}>
            <X size={14} />
          </button>
        </div>

        {/* Changelog */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {CHANGELOG.map(release => (
            <div key={release.version}>
              {/* Release divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: D.border }} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: D.text }}>{release.version}</span>
                  <span className="text-xs" style={{ color: D.textSubtle }}>·</span>
                  <span className="text-xs" style={{ color: D.textMuted }}>{release.date}</span>
                  {release.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: release.badgeColor, color: "#fff" }}>
                      {release.badge}
                    </span>
                  )}
                </div>
                <div className="h-px flex-1" style={{ background: D.border }} />
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {release.entries.map((e, i) => (
                  <div key={i} className="flex gap-3.5 p-4 rounded-2xl border"
                    style={{ background: D.surface, borderColor: D.border }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: dark ? e.darkBg : e.lightBg }}>
                      <e.icon size={15} style={{ color: e.color }} />
                    </div>
                    <div>
                      <div className="mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: dark ? D.surfaceAlt : "#f0f2f5", color: D.textMuted }}>
                          {e.type}
                        </span>
                      </div>
                      <p className="text-sm font-bold mb-1" style={{ color: D.text }}>{e.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: D.textMuted }}>{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0 flex items-center justify-between"
          style={{ background: D.surface, borderTop: `1px solid ${D.border}` }}>
          <p className="text-xs" style={{ color: D.textMuted }}>Have a feature request or feedback?</p>
          <a href={`mailto:${SUPPORT_EMAIL}`}
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "#4f6ef7" }}>
            {SUPPORT_EMAIL} →
          </a>
        </div>
      </div>
    </div>
  );
}