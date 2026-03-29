/**
 * LoginModal.jsx  —  JWT-backed login for LegalEase AI
 * Screens:  "login" | "signup" | "forgot" | "reset" | "terms"
 */
import { useState, useEffect } from "react";
import {
  Scale, Loader2, User, Mail, Lock,
  Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle,
  AlertCircle, X, FileText, Shield, AlertTriangle
} from "lucide-react";
import { DARK, LIGHT, API_BASE } from "../theme.js";

// ── fetch helper ──────────────────────────────────────────────────────────────
async function apiPost(path, body) {
  const res  = await fetch(`${API_BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong.");
  return data;
}

// ── shared input field ────────────────────────────────────────────────────────
function Field({ icon: Icon, type = "text", placeholder, value, onChange, onKeyDown, rightSlot, dark }) {
  const D = dark ? DARK : LIGHT;
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: D.textSubtle }} />
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} onKeyDown={onKeyDown}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: D.surfaceAlt, border: `1px solid ${D.border}`,
          color: D.text, paddingLeft: 36,
          paddingRight: rightSlot ? 40 : 16,
          fontFamily: "inherit",
        }}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

// ── error banner ──────────────────────────────────────────────────────────────
function ErrBanner({ msg, dark }) {
  if (!msg) return null;
  return (
    <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
      style={{
        background: dark ? "#2a0d0d" : "#fff0f0",
        color:      dark ? "#f87171" : "#b91c1c",
        border:    `1px solid ${dark ? "#4a1919" : "#fca5a5"}`,
      }}>
      <AlertCircle size={12} className="flex-shrink-0" />{msg}
    </div>
  );
}

// ── success banner ────────────────────────────────────────────────────────────
function OkBanner({ msg, dark }) {
  if (!msg) return null;
  return (
    <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
      style={{
        background: dark ? "#0e2a1a" : "#f0fdf4",
        color:      dark ? "#4ade80" : "#15803d",
        border:    `1px solid ${dark ? "#1a4731" : "#bbf7d0"}`,
      }}>
      <CheckCircle size={12} className="flex-shrink-0" />{msg}
    </div>
  );
}

// ── submit button ─────────────────────────────────────────────────────────────
function SubmitBtn({ loading, disabled, children, onClick }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center
                 justify-center gap-2 transition-all hover:opacity-90 active:scale-[.98]
                 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", boxShadow: "0 4px 20px rgba(79,110,247,.35)" }}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

// ── logo ──────────────────────────────────────────────────────────────────────
function ModalLogo({ dark }) {
  const D = dark ? DARK : LIGHT;
  return (
    <div className="flex items-center gap-2.5 mb-7">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)" }}>
        <Scale size={16} className="text-white" />
      </div>
      <div>
        <span className="font-bold text-base" style={{ color: D.text }}>LegalEase </span>
        <span className="font-bold text-base" style={{ color: "#4f6ef7" }}>AI</span>
      </div>
    </div>
  );
}

// ── tab switcher ──────────────────────────────────────────────────────────────
function Tabs({ active, onSwitch, dark }) {
  const D = dark ? DARK : LIGHT;
  return (
    <div className="flex rounded-xl p-1 mb-5 gap-1" style={{ background: D.surfaceAlt }}>
      {[["login", "Sign In"], ["signup", "Create Account"]].map(([t, label]) => (
        <button key={t} onClick={() => onSwitch(t)}
          style={active === t ? { background: "#4f6ef7", color: "#fff" } : { color: D.textMuted }}
          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all">
          {label}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TERMS OF SERVICE MODAL
// ══════════════════════════════════════════════════════════════════════════════
function TermsModal({ dark, onClose }) {
  const D = dark ? DARK : LIGHT;

  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      body: "By creating an account and using LegalEase AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. These terms apply to all users including individuals, businesses, and legal professionals.",
    },
    {
      icon: Shield,
      title: "2. Service Description",
      body: "LegalEase AI provides AI-powered analysis of property and rental documents. The service extracts risk scores, summarizes clauses, identifies legal terms, and generates reports. All analysis is powered by Groq LLaMA 3.1 and is provided for informational purposes only.",
    },
    {
      icon: AlertTriangle,
      title: "3. Not Legal Advice",
      body: "LegalEase AI is NOT a law firm and does NOT provide legal advice. The analysis, summaries, risk scores, and reports generated are informational tools only and should not be relied upon as a substitute for advice from a qualified, licensed attorney. Always consult a legal professional before signing any contract.",
    },
    {
      icon: FileText,
      title: "4. Account Responsibilities",
      body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. One account per email address is permitted. You must not share your account or use another person's account without authorization.",
    },
    {
      icon: Shield,
      title: "5. Document Privacy",
      body: "Documents you upload are processed solely for the purpose of generating your analysis. We do not store your uploaded PDF files permanently on our servers. Document text is sent to the Groq AI API for analysis and is subject to Groq's privacy policy. Do not upload documents containing highly sensitive personal information beyond what is necessary.",
    },
    {
      icon: FileText,
      title: "6. Acceptable Use",
      body: "You agree not to misuse the service. Prohibited actions include: uploading malicious files, attempting to bypass security measures, using the service to harm others, scraping or copying output for resale, or using the service for any unlawful purpose. Violations may result in immediate account termination.",
    },
    {
      icon: AlertTriangle,
      title: "7. Limitation of Liability",
      body: "LegalEase AI and its developers are not liable for any damages arising from your use of this service, including but not limited to financial losses, legal disputes, or contract-related outcomes. The service is provided 'as is' without warranties of any kind, express or implied.",
    },
    {
      icon: Shield,
      title: "8. Intellectual Property",
      body: "The LegalEase AI software, design, and branding are the intellectual property of the developers. Analysis reports generated from your documents belong to you. You grant LegalEase AI a limited license to process your documents solely for providing the service.",
    },
    {
      icon: FileText,
      title: "9. Changes to Terms",
      body: "We reserve the right to modify these Terms of Service at any time. Continued use of LegalEase AI after changes are posted constitutes acceptance of the updated terms. We recommend reviewing these terms periodically.",
    },
    {
      icon: Shield,
      title: "10. Contact",
      body: "For questions about these terms, please contact us at jananiviswa05@gmail.com. We aim to respond to all inquiries within 3 business days.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="relative w-full max-w-[560px] rounded-3xl shadow-2xl flex flex-col"
        style={{
          background: dark ? "#161b22" : "#ffffff",
          border: `1px solid ${D.border}`,
          maxHeight: "85vh",
          animation: "modalIn .3s cubic-bezier(.16,1,.3,1) forwards",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${D.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)" }}>
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: D.text }}>Terms of Service</p>
              <p className="text-xs" style={{ color: D.textMuted }}>LegalEase AI · Last updated March 2025</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: D.surfaceAlt, color: D.textMuted }}>
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {/* Disclaimer banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl mb-5"
            style={{ background: dark ? "#2a1a00" : "#fffbeb", border: `1px solid ${dark ? "#4d3300" : "#fde68a"}` }}>
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <p className="text-xs leading-relaxed" style={{ color: dark ? "#fbbf24" : "#92400e" }}>
              <strong>Important:</strong> LegalEase AI is an informational tool — not a licensed legal service.
              Always consult a qualified attorney before signing any legal document.
            </p>
          </div>

          {sections.map((s, i) => (
            <div key={i} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={13} style={{ color: "#4f6ef7" }} />
                <p className="text-sm font-bold" style={{ color: D.text }}>{s.title}</p>
              </div>
              <p className="text-xs leading-relaxed pl-5" style={{ color: D.textMuted }}>{s.body}</p>
            </div>
          ))}

          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${D.border}` }}>
            <p className="text-xs text-center" style={{ color: D.textSubtle }}>
              © 2025 LegalEase AI. All rights reserved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${D.border}` }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)" }}>
            I Understand — Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN: Login
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ dark, onSuccess, onSwitch }) {
  const D = dark ? DARK : LIGHT;
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", { email: email.trim(), password: pw });
      onSuccess(data.token, data.user);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <ModalLogo dark={dark} />
      <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>Welcome back</h2>
      <p className="text-sm mb-6" style={{ color: D.textMuted }}>
        Sign in to save and revisit your document analyses.
      </p>
      <Tabs active="login" onSwitch={onSwitch} dark={dark} />
      <div className="space-y-3 mb-2">
        <Field dark={dark} icon={Mail} type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} />
        <Field dark={dark} icon={Lock} type={showPw ? "text" : "password"}
          placeholder="Password (min 6 chars)" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          rightSlot={
            <button onClick={() => setShowPw(!showPw)} style={{ color: D.textMuted }}
              className="opacity-60 hover:opacity-100 transition-opacity">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
      </div>
      <div className="flex justify-end mb-4">
        <button onClick={() => onSwitch("forgot")}
          className="text-xs font-medium hover:opacity-80 transition-opacity"
          style={{ color: "#4f6ef7" }}>
          Forgot password?
        </button>
      </div>
      <ErrBanner msg={err} dark={dark} />
      <SubmitBtn loading={loading} onClick={submit}>Sign In →</SubmitBtn>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN: Sign Up
// ══════════════════════════════════════════════════════════════════════════════
function SignupScreen({ dark, onSuccess, onSwitch, onShowTerms }) {
  const D = dark ? DARK : LIGHT;
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!name.trim())                          { setErr("Please enter your full name."); return; }
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email address."); return; }
    if (pw.length < 6)                         { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await apiPost("/auth/register", { name: name.trim(), email: email.trim(), password: pw });
      onSuccess(data.token, data.user);
    } catch (e) {
      // Surface the backend error directly — includes "already exists" message
      setErr(e.message);
    }
    finally { setLoading(false); }
  };

  return (
    <>
      <ModalLogo dark={dark} />
      <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>Create your account</h2>
      <p className="text-sm mb-6" style={{ color: D.textMuted }}>
        Start analyzing property documents in seconds.
      </p>
      <Tabs active="signup" onSwitch={onSwitch} dark={dark} />
      <div className="space-y-3 mb-4">
        <Field dark={dark} icon={User} placeholder="Full name"
          value={name} onChange={e => setName(e.target.value)} />
        <Field dark={dark} icon={Mail} type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} />
        <Field dark={dark} icon={Lock} type={showPw ? "text" : "password"}
          placeholder="Password (min 6 chars)" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          rightSlot={
            <button onClick={() => setShowPw(!showPw)} style={{ color: D.textMuted }}
              className="opacity-60 hover:opacity-100 transition-opacity">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
      </div>
      <ErrBanner msg={err} dark={dark} />
      <SubmitBtn loading={loading} onClick={submit}>Create Account →</SubmitBtn>
      <p className="text-center text-xs mt-4" style={{ color: D.textSubtle }}>
        By signing up you agree to our{" "}
        <button
          onClick={onShowTerms}
          className="font-semibold hover:underline transition-all"
          style={{ color: "#4f6ef7" }}>
          Terms of Service
        </button>
      </p>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN: Forgot Password
// ══════════════════════════════════════════════════════════════════════════════
function ForgotScreen({ dark, onSwitch }) {
  const D = dark ? DARK : LIGHT;
  const [email,   setEmail]   = useState("");
  const [err,     setErr]     = useState("");
  const [ok,      setOk]      = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setOk("");
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email."); return; }
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email: email.trim() });
      setOk("If that email is registered, a reset link has been sent. Check your inbox.");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => onSwitch("login")}
        className="flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-80 transition-opacity"
        style={{ color: D.textMuted }}>
        <ArrowLeft size={13} /> Back to Sign In
      </button>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", boxShadow: "0 4px 14px rgba(79,110,247,.35)" }}>
        <KeyRound size={18} className="text-white" />
      </div>
      <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>Forgot your password?</h2>
      <p className="text-sm mb-6" style={{ color: D.textMuted }}>
        Enter your email and we'll send a reset link.
      </p>
      <div className="mb-4">
        <Field dark={dark} icon={Mail} type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
      </div>
      <ErrBanner msg={err} dark={dark} />
      <OkBanner  msg={ok}  dark={dark} />
      <SubmitBtn loading={loading} onClick={submit}>Send Reset Link →</SubmitBtn>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN: Reset Password
// ══════════════════════════════════════════════════════════════════════════════
function ResetScreen({ dark, onSwitch, prefillToken }) {
  const D = dark ? DARK : LIGHT;
  const [token,   setToken]   = useState(prefillToken || "");
  const [pw,      setPw]      = useState("");
  const [pw2,     setPw2]     = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [err,     setErr]     = useState("");
  const [ok,      setOk]      = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setOk("");
    if (!token.trim()) { setErr("Reset token is missing."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pw !== pw2)    { setErr("Passwords do not match."); return; }
    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { token: token.trim(), new_password: pw });
      setOk("Password reset! Redirecting to sign in…");
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => onSwitch("login"), 1800);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => onSwitch("login")}
        className="flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-80 transition-opacity"
        style={{ color: D.textMuted }}>
        <ArrowLeft size={13} /> Back to Sign In
      </button>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)", boxShadow: "0 4px 14px rgba(74,222,128,.3)" }}>
        <KeyRound size={18} className="text-white" />
      </div>
      <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>Set a new password</h2>
      <p className="text-sm mb-6" style={{ color: D.textMuted }}>
        Enter your reset token and choose a new password.
      </p>
      <div className="space-y-3 mb-4">
        {!prefillToken && (
          <Field dark={dark} icon={KeyRound} placeholder="Paste reset token"
            value={token} onChange={e => setToken(e.target.value)} />
        )}
        <Field dark={dark} icon={Lock} type={showPw ? "text" : "password"}
          placeholder="New password (min 6 chars)" value={pw}
          onChange={e => setPw(e.target.value)}
          rightSlot={
            <button onClick={() => setShowPw(!showPw)} style={{ color: D.textMuted }}
              className="opacity-60 hover:opacity-100 transition-opacity">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <Field dark={dark} icon={Lock} type={showPw ? "text" : "password"}
          placeholder="Confirm new password" value={pw2}
          onChange={e => setPw2(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
      </div>
      <ErrBanner msg={err} dark={dark} />
      <OkBanner  msg={ok}  dark={dark} />
      <SubmitBtn loading={loading} disabled={!!ok} onClick={submit}>Reset Password →</SubmitBtn>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
// BroadcastChannel key for cross-tab reset-token handoff
const RESET_CHANNEL = "legalease_reset";

export default function LoginModal({ dark, onLogin }) {
  const urlToken = new URLSearchParams(window.location.search).get("reset_token") || "";
  const [screen,     setScreen]     = useState(urlToken ? "reset" : "login");
  const [resetToken, setResetToken] = useState(urlToken);
  const [showTerms,  setShowTerms]  = useState(false);

  useEffect(() => {
    // ── Case A: This tab was opened by clicking the email link ──────────────
    // It has the token in the URL. Broadcast it to any existing tab, then
    // close this tab so the user ends up on the original tab.
    if (urlToken) {
      const ch = new BroadcastChannel(RESET_CHANNEL);
      ch.postMessage({ reset_token: urlToken });
      ch.close();
      // Give the message time to arrive, then close this tab
      setTimeout(() => window.close(), 300);
      return;
    }

    // ── Case B: This is the existing tab ────────────────────────────────────
    // Listen for a token broadcast from the newly-opened tab.
    const ch = new BroadcastChannel(RESET_CHANNEL);
    ch.onmessage = (e) => {
      const tok = e.data?.reset_token;
      if (tok) {
        setResetToken(tok);
        setScreen("reset");
        // Clean the URL in case it somehow got the token too
        window.history.replaceState({}, "", window.location.pathname);
      }
    };
    return () => ch.close();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const onSwitch = (next, tok = "") => {
    if (tok) setResetToken(tok);
    setScreen(next);
  };

  // ── If this IS the redirect tab, render a brief "Redirecting…" screen
  // so it doesn't flash the login form before closing
  if (urlToken) {
    const D = dark ? DARK : LIGHT;
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(16px)" }}>
        <div className="flex flex-col items-center gap-4 rounded-3xl p-10"
          style={{ background: dark ? "#161b22" : "#ffffff", border: `1px solid ${D.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)" }}>
            <KeyRound size={20} className="text-white" />
          </div>
          <p className="text-sm font-bold" style={{ color: D.text }}>Opening reset form…</p>
          <p className="text-xs text-center" style={{ color: D.textMuted }}>
            This tab will close automatically.<br/>Return to your original LegalEase tab.
          </p>
        </div>
      </div>
    );
  }

  const D = dark ? DARK : LIGHT;

  return (
    <>
      {/* Terms of Service overlay */}
      {showTerms && <TermsModal dark={dark} onClose={() => setShowTerms(false)} />}

      {/* Main login backdrop */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(16px)" }}>
        <div
          style={{
            background: dark ? "#161b22" : "#ffffff",
            border: `1px solid ${D.border}`,
            animation: "modalIn .35s cubic-bezier(.16,1,.3,1) forwards",
          }}
          className="relative w-full max-w-[420px] rounded-3xl p-8 shadow-2xl">

          {screen === "login"  && <LoginScreen  dark={dark} onSuccess={onLogin} onSwitch={onSwitch} />}
          {screen === "signup" && (
            <SignupScreen
              dark={dark}
              onSuccess={onLogin}
              onSwitch={onSwitch}
              onShowTerms={() => setShowTerms(true)}
            />
          )}
          {screen === "forgot" && <ForgotScreen dark={dark} onSwitch={onSwitch} />}
          {screen === "reset"  && <ResetScreen  dark={dark} onSwitch={onSwitch} prefillToken={resetToken} />}
        </div>
      </div>
    </>
  );
}
