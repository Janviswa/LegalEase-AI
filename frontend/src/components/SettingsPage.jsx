import { useState } from "react";
import {
  Bell, Lock, Cpu, Sliders, Trash2, Check,
  Moon, Sun, Eye, EyeOff, ChevronRight, User, Mail, Shield,
  AlertTriangle, Loader2, KeyRound, RefreshCw, Download, Palette,
  Info, CheckCircle, Pencil, Save, X
} from "lucide-react";
import { DARK, LIGHT, API_BASE, SUPPORT_EMAIL } from "../theme.js";
import { Avatar, Toggle } from "./UI.jsx";

// ─── local-storage helpers ────────────────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const PREFS_KEY = (email) => `legalease_prefs_${email || "guest"}`;

const DEFAULT_PREFS = {
  notif:       true,
  autoAnalyze: false,
  depth:       "Standard",
};

export default function SettingsPage({ dark, setDark, user, toast, token, onClearHistory, updateName }) {
  const D = dark ? DARK : LIGHT;

  // ── Preferences state (persisted to localStorage) ─────────────────────────
  const [prefs, setPrefs] = useState(() => LS.get(PREFS_KEY(user?.email), DEFAULT_PREFS));
  const setPref = (k, v) => setPrefs(p => { const n = { ...p, [k]: v }; LS.set(PREFS_KEY(user?.email), n); return n; });

  // ── Save indicator ────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(false);
  const saveAll = () => {
    LS.set(PREFS_KEY(user?.email), prefs);
    setSaved(true);
    toast("Settings saved!", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Profile edit ──────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameVal,     setNameVal]     = useState(user?.name || "");
  const [nameSaving,  setNameSaving]  = useState(false);

  // ── Change password ───────────────────────────────────────────────────────
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pwOld,     setPwOld]     = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showCfm,   setShowCfm]   = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Delete history confirm ────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Export ────────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);

  // ─── helpers ──────────────────────────────────────────────────────────────
  const pwStrength = (pw) => {
    if (!pw) return null;
    let s = 0;
    if (pw.length >= 8)            s++;
    if (/[A-Z]/.test(pw))          s++;
    if (/[0-9]/.test(pw))          s++;
    if (/[^A-Za-z0-9]/.test(pw))   s++;
    return s; // 0-4
  };
  const strength = pwStrength(pwNew);
  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Very Strong"][strength] || "";
  const strengthColor = ["#f87171", "#fbbf24", "#fbbf24", "#4ade80", "#4ade80"][strength] || "#f87171";

  // ── change password handler ────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError("");
    if (!pwOld)                       return setPwError("Enter your current password.");
    if (pwNew.length < 6)             return setPwError("New password must be at least 6 characters.");
    if (pwNew !== pwConfirm)          return setPwError("Passwords do not match.");
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to change password.");
      setPwSuccess(true);
      setPwOld(""); setPwNew(""); setPwConfirm("");
      toast("Password changed successfully!", "success");
      setTimeout(() => { setPwOpen(false); setPwSuccess(false); }, 2000);
    } catch (e) {
      setPwError(e.message);
    }
    setPwLoading(false);
  };

  // ── export data handler ────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true);
    try {
      const data = {
        exported_at: new Date().toISOString(),
        user: { name: user?.name, email: user?.email, plan: user?.plan },
        preferences: prefs,
        history: LS.get(`legalease_history_${user?.email}`, []),
        documents: LS.get(`legalease_docs_${user?.email}`, []),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `legalease_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      toast("Data exported successfully!", "success");
    } catch {
      toast("Export failed.", "error");
    }
    setTimeout(() => setExporting(false), 1000);
  };

  // ── clear history handler ──────────────────────────────────────────────────
  const handleClearHistory = () => {
    onClearHistory();
    // also clear doc history
    LS.set(`legalease_docs_${user?.email}`, []);
    toast("All history cleared.", "info");
    setConfirmDelete(false);
  };

  // ─── sub-components ───────────────────────────────────────────────────────
  const Section = ({ title, icon: Icon, iconColor = "#4f6ef7", children }) => (
    <div className="rounded-2xl border overflow-hidden mb-4"
      style={{ background: D.surface, borderColor: D.border }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: `1px solid ${D.border}`, background: D.surfaceAlt }}>
        {Icon && (
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: dark ? "rgba(79,110,247,0.15)" : "#eef0ff" }}>
            <Icon size={12} style={{ color: iconColor }} />
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: D.textSubtle }}>{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );

  const Row = ({ icon: Icon, label, desc, last, children }) => (
    <div className="flex items-center justify-between px-5 py-3.5 border-b"
      style={{ borderColor: last ? "transparent" : D.borderLight }}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: D.surfaceAlt }}>
          <Icon size={13} style={{ color: D.textMuted }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight" style={{ color: D.text }}>{label}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>{desc}</p>}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );

  const Sel = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="text-xs rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer"
      style={{ background: D.surfaceAlt, color: D.text, borderColor: D.border }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const PwInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="w-full px-3 py-2.5 rounded-xl text-xs outline-none pr-9"
        style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button type="button" onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2"
        style={{ color: D.textMuted }}>
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: D.bg }}>
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: D.text }}>Settings</h2>
            <p className="text-sm" style={{ color: D.textMuted }}>Manage your account, preferences & data</p>
          </div>
          <button onClick={saveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={saved
              ? { background: dark ? "#0e2a1a" : "#dcfce7", color: "#4ade80", border: `1px solid ${dark ? "#1a4731" : "#86efac"}` }
              : { background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }}>
            {saved ? <><CheckCircle size={14} />Saved!</> : <><Save size={14} />Save Changes</>}
          </button>
        </div>

        {/* ══ ACCOUNT ══════════════════════════════════════════════════════ */}
        <Section title="Account" icon={User}>

          {/* Profile card */}
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${D.borderLight}` }}>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || "Guest"} size="lg" />
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-sm font-bold outline-none"
                      style={{ background: D.surfaceAlt, border: `1px solid #4f6ef7`, color: D.text }}
                      value={nameVal}
                      onChange={e => setNameVal(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        if (!nameVal.trim()) return toast("Name cannot be empty.", "error");
                        setNameSaving(true);
                        try {
                          await updateName(nameVal.trim(), token);
                          setEditingName(false);
                          toast("Name updated successfully!", "success");
                        } catch (e) {
                          toast(e.message || "Failed to update name.", "error");
                        }
                        setNameSaving(false);
                      }}
                      disabled={nameSaving}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                      style={{ background: dark ? "rgba(34,197,94,0.15)" : "#dcfce7", color: "#22c55e" }}>
                      {nameSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameVal(user?.name || ""); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: D.surfaceAlt, color: D.textMuted }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: D.text }}>{user?.name || "Not signed in"}</p>
                    {user && (
                      <button onClick={() => setEditingName(true)}
                        className="w-5 h-5 rounded flex items-center justify-center opacity-50 hover:opacity-100"
                        style={{ color: D.textMuted }}>
                        <Pencil size={10} />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: D.textMuted }}>
                  <Mail size={10} />{user?.email || "Sign in to save your history"}
                </p>
                {user && (
                  <div className="mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a4731" : "#86efac"}` }}>
                      ✓ Verified
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Change Password row → expands inline */}
          <div>
            <div
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderBottom: `1px solid ${D.borderLight}` }}
              onClick={() => { setPwOpen(o => !o); setPwError(""); setPwSuccess(false); }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: D.surfaceAlt }}>
                  <Lock size={13} style={{ color: D.textMuted }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: D.text }}>Change Password</p>
                  <p className="text-xs" style={{ color: D.textMuted }}>Update your account password</p>
                </div>
              </div>
              <ChevronRight size={14} style={{
                color: D.textMuted,
                transform: pwOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }} />
            </div>

            {pwOpen && (
              <div className="px-5 py-4 space-y-3" style={{ borderBottom: `1px solid ${D.borderLight}`, background: dark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.02)" }}>
                {pwSuccess ? (
                  <div className="flex items-center gap-3 py-2">
                    <CheckCircle size={16} style={{ color: "#4ade80" }} />
                    <span className="text-sm font-medium" style={{ color: "#4ade80" }}>Password changed successfully!</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: D.textSubtle }}>Current Password</label>
                      <PwInput value={pwOld} onChange={setPwOld} show={showOld} onToggle={() => setShowOld(o => !o)} placeholder="Enter current password" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: D.textSubtle }}>New Password</label>
                      <PwInput value={pwNew} onChange={setPwNew} show={showNew} onToggle={() => setShowNew(o => !o)} placeholder="Min. 6 characters" />
                      {pwNew && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex gap-0.5 flex-1">
                            {[0,1,2,3].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                                style={{ background: i < strength ? strengthColor : D.surfaceAlt }} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: D.textSubtle }}>Confirm New Password</label>
                      <PwInput value={pwConfirm} onChange={setPwConfirm} show={showCfm} onToggle={() => setShowCfm(o => !o)} placeholder="Repeat new password" />
                      {pwConfirm && pwNew !== pwConfirm && (
                        <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>Passwords do not match</p>
                      )}
                    </div>
                    {pwError && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: dark ? "#2a0d0d" : "#fee2e2" }}>
                        <AlertTriangle size={12} style={{ color: "#f87171" }} />
                        <span className="text-xs" style={{ color: "#f87171" }}>{pwError}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setPwOpen(false); setPwError(""); setPwOld(""); setPwNew(""); setPwConfirm(""); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ background: D.surfaceAlt, color: D.textMuted }}>
                        Cancel
                      </button>
                      <button onClick={handleChangePassword} disabled={pwLoading || !pwOld || !pwNew || !pwConfirm}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }}>
                        {pwLoading ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                        Update Password
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </Section>

        {/* ══ APPEARANCE ═══════════════════════════════════════════════════ */}
        <Section title="Appearance" icon={Palette}>
          <Row icon={dark ? Moon : Sun} label="Dark Mode" desc="Toggle between dark and light themes" last>
            <Toggle on={dark} setOn={setDark} />
          </Row>
        </Section>

        {/* ══ AI PREFERENCES ═══════════════════════════════════════════════ */}
        <Section title="AI Preferences" icon={Cpu} iconColor="#a855f7">
          <Row icon={RefreshCw} label="Auto-Analyze on Upload" desc="Begin analysis immediately when a file is uploaded">
            <Toggle on={prefs.autoAnalyze} setOn={v => setPref("autoAnalyze", v)} />
          </Row>
          <Row icon={Sliders} label="Analysis Depth" desc="How thorough the AI review should be" last>
            <Sel value={prefs.depth} onChange={v => setPref("depth", v)}
              options={["Standard", "Detailed", "Expert"]} />
          </Row>
        </Section>

        {/* ══ NOTIFICATIONS ════════════════════════════════════════════════ */}
        <Section title="Notifications" icon={Bell} iconColor="#f59e0b">
          <Row icon={Bell} label="In-App Notifications" desc="Alerts for analyses, risk detections, and document events" last>
            <Toggle on={prefs.notif} setOn={v => setPref("notif", v)} />
          </Row>
        </Section>

        {/* ══ DATA & PRIVACY ════════════════════════════════════════════════ */}
        <Section title="Data & Privacy" icon={Shield} iconColor="#22c55e">
          <Row icon={Download} label="Export My Data" desc="Download all your history and preferences as JSON">
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50 hover:opacity-80 transition-opacity"
              style={{ background: dark ? "#0d1a33" : "#eef0ff", color: "#4f6ef7", border: `1px solid ${dark ? "#1a2e5a" : "#c7d0ff"}` }}>
              {exporting ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
              {exporting ? "Exporting…" : "Export"}
            </button>
          </Row>
          <Row icon={Info} label="Data Storage" desc="Your history and account are stored securely in Supabase" last>
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
              style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e" }}>
              Cloud ✓
            </span>
          </Row>
        </Section>

        {/* ══ SUPPORT ══════════════════════════════════════════════════════ */}
        <Section title="Support" icon={Info} iconColor="#60a5fa">
          <Row icon={Mail} label="Contact Support" desc={SUPPORT_EMAIL} last>
            <a href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ background: D.surfaceAlt, color: D.textMuted, border: `1px solid ${D.border}` }}>
              <Mail size={11} /> Email
            </a>
          </Row>
        </Section>

        {/* ══ DANGER ZONE ══════════════════════════════════════════════════ */}
        <Section title="Danger Zone" icon={AlertTriangle} iconColor="#f87171">
          {!confirmDelete ? (
            <Row icon={Trash2} label="Delete All History" desc="Permanently remove all analysis records and documents" last>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                style={{ background: dark ? "#2a0d0d" : "#fee2e2", color: "#f87171", borderColor: dark ? "#4a1919" : "#fca5a5" }}>
                Delete All
              </button>
            </Row>
          ) : (
            <div className="px-5 py-4">
              <div className="rounded-xl p-4 border" style={{ background: dark ? "#2a0d0d" : "#fff5f5", borderColor: dark ? "#4a1919" : "#fca5a5" }}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={16} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#f87171" }}>Are you sure?</p>
                    <p className="text-xs mt-0.5" style={{ color: dark ? "#f87171" : "#b91c1c", opacity: 0.8 }}>
                      This will permanently delete all your analysis history and drafted documents. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold"
                    style={{ background: D.surfaceAlt, color: D.textMuted }}>
                    Cancel
                  </button>
                  <button onClick={handleClearHistory}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "#f87171", color: "#fff" }}>
                    <Trash2 size={12} /> Yes, Delete Everything
                  </button>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── footer info ── */}
        <div className="text-center pb-6">
          <p className="text-xs" style={{ color: D.textSubtle }}>LegalEase AI · v1.0.0</p>
          <p className="text-xs mt-1" style={{ color: D.textSubtle }}>
            Built for Indian legal professionals · History synced to Supabase
          </p>
        </div>

      </div>
    </div>
  );
}
