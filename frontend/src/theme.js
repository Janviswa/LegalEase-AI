// ─────────────────────────────────────────────────────────────
// 🎨 Design Tokens (Dark / Light)
// ─────────────────────────────────────────────────────────────

export const DARK = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceAlt: "#1c2230",

  border: "rgba(48,54,70,0.9)",
  borderLight: "rgba(48,54,70,0.5)",

  text: "#e6edf3",
  textMuted: "#8b949e",
  textSubtle: "#484f58",

  accent: "#4f6ef7",
  accentGlow: "rgba(79,110,247,0.15)",
};

export const LIGHT = {
  bg: "#f6f8fa",
  surface: "#ffffff",
  surfaceAlt: "#f0f2f5",

  border: "#d0d7de",
  borderLight: "#e8ecf0",

  text: "#1c2128",
  textMuted: "#57606a",
  textSubtle: "#8c959f",

  accent: "#4461e8",
  accentGlow: "rgba(68,97,232,0.08)",
};

// ─────────────────────────────────────────────────────────────
// 🧩 Utility: className joiner
// ─────────────────────────────────────────────────────────────

export const cx = (...args) => args.filter(Boolean).join(" ");

// ─────────────────────────────────────────────────────────────
// 📩 Support Email (used in footer / settings)
// ─────────────────────────────────────────────────────────────

export const SUPPORT_EMAIL = "jananiviswa05@gmail.com";

// ─────────────────────────────────────────────────────────────
// 🌐 Backend API Base
// Vite proxy maps:
//    /api  →  http://127.0.0.1:8000
// So NEVER change this unless deploying.
// ─────────────────────────────────────────────────────────────

export const API_BASE = "/api";


// ─────────────────────────────────────────────────────────────
// 🧪 MOCK RESULT (Fallback if backend fails)
// This shape MATCHES AnalyzePage.jsx expectations
// ─────────────────────────────────────────────────────────────

export const MOCK_RESULT = {
  summary:
    "A standard residential lease agreement with moderate risk factors. Some clauses favor the landlord and should be reviewed before signing.",

  riskScore: 58,
  riskLabel: "Medium",

  pros: [
    "Security deposit capped at three months.",
    "Tenant allowed renewal with notice period.",
    "Maintenance responsibilities clearly defined.",
  ],

  cons: [
    "Late payment penalty exceeds industry standard.",
    "Landlord termination notice shorter than tenant notice.",
    "Missing arbitration clause.",
  ],

  legal_terms: [
    {
      term: "Force Majeure",
      explanation:
        "A clause that releases parties from obligations during unforeseen events like natural disasters.",
    },
    {
      term: "Indemnification",
      explanation:
        "Requires one party to compensate the other for certain damages or losses.",
    },
  ],

  clauses: [
    {
      title: "Security Deposit",
      note: "3 months — standard practice",
      status: "ok",
    },
    {
      title: "Late Payment Penalty",
      note: "2% per day — negotiate lower rate",
      status: "risk",
    },
    {
      title: "Renewal Option",
      note: "30-day notice period",
      status: "ok",
    },
  ],
};