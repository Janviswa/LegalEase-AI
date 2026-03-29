import { useState, useCallback, useRef } from "react";
import {
  Scale, Moon, Sun, Bell, LogOut, ChevronDown,
  FileSearch, History, Settings, Sparkles, HelpCircle, BookOpen, HomeIcon, FilePlus2
} from "lucide-react";
import { DARK, LIGHT } from "./theme.js";
import { useToast, Toasts, Avatar } from "./components/UI.jsx";
import { useAuth } from "./useAuth.js";
import { useHistoryStore } from "./useHistoryStore.js";
import LoginModal          from "./components/LoginModal.jsx";
import AnalyzePage         from "./components/AnalyzePage.jsx";
import HistoryPage         from "./components/HistoryPage.jsx";
import SettingsPage        from "./components/SettingsPage.jsx";
import NotificationsPanel  from "./components/NotificationsPanel.jsx";
import HelpDocsPage        from "./components/HelpDocsPage.jsx";
import WhatsNewPage        from "./components/WhatsNewPage.jsx";
import ChatWidget          from "./components/ChatWidget.jsx";
import LawsPage            from "./components/LawsPage.jsx";
import HomePage            from "./components/HomePage.jsx";
import DraftPage           from "./components/DraftPage.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────
let _nid = 1;
const makeNotif = (type, title, body) => ({
  id: _nid++, type, title, body, read: false, time: new Date(),
});

export default function App() {
  const [dark, setDark]                 = useState(true);
  const [page, setPage]                 = useState("Home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showHelp, setShowHelp]         = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // ── JWT auth state ────────────────────────────────────────────────────────
  const { user, token, storeLogin, clearLogin, updateName, isLoggedIn } = useAuth();

  // ── Shared state (unchanged from original) ────────────────────────────────
  // History persisted per user email via localStorage
  const { history, setHistory, addEntry: addHistoryEntry, toggleStar, deleteEntry, clearHistory } = useHistoryStore(user?.email, token);
  const [notifications, setNotifications] = useState([]);
  const [lastAnalysis, setLastAnalysis]   = useState(null);
  const [lastFileName, setLastFileName]   = useState(null);
  const [lastPageContext, setLastPageContext] = useState(null);
  const [docHistory,   setDocHistory]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(`legalease_docs_${user?.email || "guest"}`) || "[]"); } catch { return []; }
  });

  const addDocEntry = (entry) => {
    setDocHistory(prev => {
      const next = [entry, ...prev];
      try { localStorage.setItem(`legalease_docs_${user?.email || "guest"}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const { toasts, show: toast } = useToast();
  const D = dark ? DARK : LIGHT;

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Read notif preference ─────────────────────────────────────────────────
  const getNotifPref = () => {
    try {
      const key = `legalease_prefs_${user?.email || "guest"}`;
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored).notif ?? true) : true;
    } catch { return true; }
  };

  // ── Callbacks (all preserved from original) ───────────────────────────────
  const handleAnalysisComplete = useCallback(({ fileName, fileSize, riskLabel, riskScore, date, result, depth }) => {
    setLastAnalysis(result);
    setLastFileName(fileName);

    addHistoryEntry({
      id:         crypto.randomUUID(),   // proper UUID string for Supabase
      name:       fileName,
      size:       fileSize,
      risk:       riskLabel,
      risk_score: riskScore,             // snake_case matches backend model
      riskScore:  riskScore,             // keep camelCase for frontend UI compatibility
      depth:      depth || null,
      date:       new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      starred:    false,
      result,
    });

    // Only push bell notifications if notif pref is enabled
    if (getNotifPref()) {
      const successNotif = makeNotif(
        "success", "Analysis complete",
        `"${fileName}" — Risk Score: ${riskScore}/100 (${riskLabel} Risk). ${result.cons.length} risk clause${result.cons.length !== 1 ? "s" : ""} detected.`
      );
      setNotifications(prev => [successNotif, ...prev]);

      if (riskLabel === "High") {
        const riskNotif = makeNotif(
          "risk", "High-risk document detected",
          `"${fileName}" scored ${riskScore}/100. ${result.cons.length} red flag${result.cons.length !== 1 ? "s" : ""} require attention before signing.`
        );
        setNotifications(prev => [riskNotif, ...prev]);
      }
    }
  }, [user]);

  const handleDownloadNotif = useCallback((fileName) => {
    const notif = makeNotif(
      "doc", "Report downloaded",
      `Analysis report for "${fileName}" was saved to your Downloads folder.`
    );
    setNotifications(prev => [notif, ...prev]);
  }, []);

  // ── Login: store JWT, show welcome toast, redirect to Analyzer ────────────
  const handleLogin = useCallback((jwt, userData) => {
    storeLogin(jwt);
    toast(`Welcome, ${userData.name.split(" ")[0]}! 🎉`, "success");
    const notif = makeNotif("info", "Signed in", `Welcome back, ${userData.name}! Your analysis history is ready.`);
    setNotifications(prev => [notif, ...prev]);
    setPage("Home");                              // ← redirect to Home page
  }, [storeLogin, toast]);

  // ── Logout: clear JWT + reset all shared state ────────────────────────────
  const handleLogout = useCallback(() => {
    clearLogin();
    setShowUserMenu(false);
    // history stays in localStorage — reloads on next login via useHistoryStore
    setNotifications([]);
    setLastAnalysis(null);
    setLastFileName(null);
    toast("Signed out.", "info");
  }, [clearLogin, toast]);

  const handleClearHistory = useCallback(() => { clearHistory(); }, [clearHistory]);

  const NAV = [
    { id: "Home",      icon: HomeIcon   },
    { id: "Analyzer",  icon: FileSearch },
    { id: "Drafts",    icon: FilePlus2  },
    { id: "History",   icon: History    },
    { id: "Laws",      icon: BookOpen   },
    { id: "Settings",  icon: Settings   },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none"
      style={{ background: D.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Login gate — modal shown on top when user is not logged in ── */}
      {!isLoggedIn && <LoginModal dark={dark} onLogin={handleLogin} />}

      {/* ── Navbar ── */}
      <nav className="flex items-center h-[54px] px-5 gap-4 flex-shrink-0 z-50"
        style={{ background: D.surface, borderBottom: `1px solid ${D.border}` }}>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", boxShadow: "0 2px 10px rgba(79,110,247,.4)" }}>
            <Scale size={14} className="text-white" />
          </div>
          <span className="font-bold text-[15px]" style={{ color: D.text }}>
            LegalEase <span style={{ color: "#4f6ef7" }}>AI</span>
          </span>
        </div>

        {/* Nav pills */}
        <div className="flex items-center gap-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={page === n.id
                ? { background: dark ? "#1c2230" : "#e8eeff", color: "#4f6ef7" }
                : { color: D.textMuted, background: "transparent" }}
              onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.color = D.text; }}
              onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.color = D.textMuted; }}>
              <n.icon size={13} />{n.id}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* AI Live badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: "#0e2a1a", color: "#4ade80", border: "1px solid #1a4731" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Live
        </div>

        {/* Bell */}
        <button
          onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-colors hover:opacity-80"
          style={{
            background: showNotifs ? (dark ? "#1c2230" : "#e8eeff") : D.surfaceAlt,
            color: showNotifs ? "#4f6ef7" : D.textMuted,
          }}>
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: "#f87171", color: "#fff" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button onClick={() => setDark(!dark)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
          style={{ background: D.surfaceAlt, color: D.textMuted }}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* User menu (always present after login) */}
        {user && (
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
              className="flex items-center gap-2 px-2 py-1 rounded-xl transition-colors hover:opacity-80"
              style={{ background: D.surfaceAlt }}>
              <Avatar name={user.name} />
              <span className="text-xs font-bold hidden sm:block" style={{ color: D.text }}>
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown size={12} style={{ color: D.textMuted }} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden z-50"
                style={{ background: D.surface, borderColor: D.border, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

                {/* User info */}
                <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${D.border}` }}>
                  <p className="text-sm font-bold" style={{ color: D.text }}>{user.name}</p>
                  <p className="text-xs mb-2"      style={{ color: D.textMuted }}>{user.email}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a4731" : "#86efac"}` }}>
                    ✓ Verified
                  </span>
                </div>

                {[
                  { label: "Settings",    icon: Settings,   action: () => { setPage("Settings"); setShowUserMenu(false); } },
                  { label: "Help & Docs", icon: HelpCircle, action: () => { setShowHelp(true);     setShowUserMenu(false); } },
                  { label: "What's New",  icon: Sparkles,   action: () => { setShowWhatsNew(true); setShowUserMenu(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors"
                    style={{ color: D.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = D.surfaceAlt; e.currentTarget.style.color = D.text; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.textMuted; }}>
                    <item.icon size={13} />{item.label}
                  </button>
                ))}

                <div style={{ borderTop: `1px solid ${D.border}` }}>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors"
                    style={{ color: "#f87171" }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "#2a0d0d" : "#fee2e2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Page body ── */}
      {/* Pages are hidden with display:none instead of unmounting so their
          local state (uploaded file, analysis result, draft content, etc.)
          is preserved when the user navigates away and comes back.         */}
      <div className="flex flex-1 overflow-hidden">

        <div style={{ display: page === "Home" ? "flex" : "none", flex: 1, overflow: "hidden" }}>
          <HomePage
            dark={dark}
            user={user}
            onGoAnalyze={() => setPage("Analyzer")}
            onGoLaws={() => setPage("Laws")}
            onGoDrafts={() => setPage("Drafts")}
          />
        </div>

        <div style={{ display: page === "Analyzer" ? "flex" : "none", flex: 1, overflow: "hidden" }}>
          <AnalyzePage
            dark={dark}
            toast={toast}
            token={token}
            user={user}
            onAnalysisComplete={handleAnalysisComplete}
            onDownload={handleDownloadNotif}
          />
        </div>

        <div style={{ display: page === "Drafts" ? "flex" : "none", flex: 1, overflow: "hidden" }}>
          <DraftPage
            dark={dark}
            token={token}
            toast={toast}
            onDocCreated={addDocEntry}
            onPageContext={setLastPageContext}
          />
        </div>

        {page === "History" && (
          <HistoryPage
            dark={dark}
            history={history}
            setHistory={setHistory}
            toggleStar={toggleStar}
            deleteEntry={deleteEntry}
            docHistory={docHistory}
            setDocHistory={setDocHistory}
            onGoAnalyze={() => setPage("Analyzer")}
            onGoDocuments={() => setPage("Drafts")}
            token={token}
          />
        )}

        {page === "Laws" && (
          <LawsPage
            dark={dark}
          />
        )}

        {page === "Settings" && (
          <SettingsPage
            dark={dark}
            setDark={setDark}
            user={user}
            toast={toast}
            token={token}
            onClearHistory={handleClearHistory}
            updateName={updateName}
          />
        )}
      </div>

      {/* ── Panels & overlays ── */}
      {showNotifs && (
        <NotificationsPanel
          dark={dark}
          notifications={notifications}
          setNotifications={setNotifications}
          onClose={() => setShowNotifs(false)}
        />
      )}

      {showHelp     && <HelpDocsPage dark={dark} onClose={() => setShowHelp(false)} />}
      {showWhatsNew && <WhatsNewPage dark={dark} onClose={() => setShowWhatsNew(false)} />}

      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      {/* ── Floating AI Chat Widget — always mounted to preserve conversation ── */}
      {/* Fix #8: visible only on relevant pages but never unmounted so messages survive */}
      <ChatWidget
        dark={dark}
        analysisResult={lastAnalysis}
        fileName={lastFileName}
        token={token}
        currentPage={page}
        pageContext={lastPageContext}
        visible={["Home", "Analyzer", "Drafts", "Laws"].includes(page)}
      />

      <Toasts toasts={toasts} />

      <style>{`
        ::-webkit-scrollbar       { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${dark ? "#2d3348" : "#c8cdd5"}; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:${dark ? "#3d4560" : "#a0a7b1"}; }
        input::placeholder        { color:${dark ? "#484f58" : "#9ca3af"}; }
        @keyframes slideIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  );
}