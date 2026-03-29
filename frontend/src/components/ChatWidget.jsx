import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, User, Minimize2,
  Maximize2, Sparkles, FileText, AlertCircle, Loader2,
  ChevronDown, Scale
} from "lucide-react";
import { API_BASE } from "../theme.js";

const PAGE_DESCRIPTIONS = {
  Home:     "The LegalEase AI home page showing an overview of features: document analysis, draft studio, and legal resources.",
  Analyzer: "The Document Analyzer page where users upload PDF/Word/TXT legal documents to get instant AI risk analysis, including risk score, pros & cons, legal terms explained, and clause-by-clause review.",
  Drafts:   "The Draft Studio page where users create legal documents from templates (Lease, Sale, Deed, NDA, POA etc.), fill in details, add custom sections, and get AI analysis before downloading or sending for e-signature.",
  Laws:     "The Laws & Resources page providing information about Indian property laws, rental regulations, and legal references.",
};

const QUICK_QUESTIONS = [
  "What are the main risks in this document?",
  "Explain the termination clauses",
  "Is this agreement fair for the tenant?",
  "What should I negotiate before signing?",
];

function ChatBubble({ msg, dark }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #4f6ef7, #7c3aed)"
            : dark ? "#1c2230" : "#f0f2f5",
          border: isUser ? "none" : `1px solid ${dark ? "#2d3348" : "#e0e4ea"}`,
        }}
      >
        {isUser
          ? <User size={13} className="text-white" />
          : <Scale size={13} style={{ color: "#4f6ef7" }} />}
      </div>
      <div
        className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #4f6ef7, #6d28d9)"
            : dark ? "#1c2230" : "#f0f2f5",
          color: isUser ? "#fff" : dark ? "#e6edf3" : "#1c2128",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          boxShadow: isUser
            ? "0 4px 16px rgba(79,110,247,0.3)"
            : dark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator({ dark }) {
  return (
    <div className="flex items-end gap-2.5">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: dark ? "#1c2230" : "#f0f2f5", border: `1px solid ${dark ? "#2d3348" : "#e0e4ea"}` }}
      >
        <Scale size={13} style={{ color: "#4f6ef7" }} />
      </div>
      <div
        className="px-4 py-3 rounded-2xl flex items-center gap-1"
        style={{ background: dark ? "#1c2230" : "#f0f2f5", borderRadius: "18px 18px 18px 4px" }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#4f6ef7", animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWidget({ dark, analysisResult, fileName, token, currentPage, pageContext, visible = true }) {
  const [open, setOpen]         = useState(false);
  const [minimized, setMin]     = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: analysisResult
      ? `Hello! I've analyzed "${fileName}" and I'm ready to answer your questions about it. What would you like to know?`
      : "Hello! I'm your LegalEase AI assistant. Ask me anything about this page, your documents, or Indian property law.",
  }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Reset greeting when analysis result or page changes
  useEffect(() => {
    if (analysisResult && fileName) {
      setMessages([{
        role: "assistant",
        content: `I've finished analyzing "${fileName}" (Risk Score: ${analysisResult.riskScore}/100 — ${analysisResult.riskLabel} Risk). Ask me anything about the document!`,
      }]);
    }
  }, [analysisResult, fileName]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open, minimized]);

  const buildSystemPrompt = useCallback(() => {
    const pageDesc = PAGE_DESCRIPTIONS[currentPage] || "the LegalEase AI app";
    let prompt = `You are LegalEase AI, a smart legal assistant embedded in a property document app.

CURRENT PAGE: ${pageDesc}
`;

    if (pageContext) {
      prompt += `\nDOCUMENT/PAGE CONTENT (what the user is currently viewing):
${pageContext.slice(0, 3000)}
`;
    }

    if (analysisResult) {
      prompt += `
ANALYSIS RESULTS for "${fileName}":
- Risk Score: ${analysisResult.riskScore}/100
- Risk Level: ${analysisResult.riskLabel}
- Summary: ${analysisResult.summary}
- Favorable Clauses: ${analysisResult.pros?.join("; ")}
- Risks & Red Flags: ${analysisResult.cons?.join("; ")}
- Legal Terms: ${analysisResult.legal_terms?.map(t => `${t.term}: ${t.explanation}`).join("; ")}
`;
    }

    prompt += `
INSTRUCTIONS:
- Answer questions about the current page and any document shown.
- Explain legal clauses, terms, or concepts in plain English.
- Be concise (2–4 sentences unless detail is needed).
- Use bullet points only when listing multiple items.
- Always recommend consulting a qualified lawyer for final decisions.
- If asked about the page layout or features, explain what you know from the page description above.`;

    return prompt;
  }, [analysisResult, fileName, currentPage, pageContext]);

  // Route all chat through the backend /chat endpoint which holds the real Groq API key.
  // Never call api.groq.com from the browser — the API key must stay server-side.
  const callGroq = useCallback(async (messagesPayload) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages: messagesPayload }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "I couldn't generate a response.";
  }, [token]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const reply = await callGroq([
        { role: "system", content: buildSystemPrompt() },
        ...history,
        { role: "user", content: userMsg },
      ]);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please ensure the backend is running and your Groq API key is configured.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, buildSystemPrompt, callGroq]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Fix #8: use display:none when on pages that don't show chat,
  // so the component stays mounted and conversation is preserved
  return (
    <div style={{ display: visible ? "contents" : "none" }}>
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,110,247,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(79,110,247,0); }
        }
        @keyframes chatWiggle {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(-8deg); }
          75%       { transform: rotate(8deg); }
        }
      `}</style>

      {/* ── Floating Button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4f6ef7, #6d28d9)",
            boxShadow: "0 8px 32px rgba(79,110,247,0.45)",
            animation: "chatPulse 2.5s ease-in-out infinite",
          }}
          title="Chat with AI about your document"
        >
          <MessageCircle size={22} className="text-white" style={{ animation: "chatWiggle 3s ease-in-out 2s infinite" }} />
          {analysisResult && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: "#4ade80", border: "2px solid #0d1117" }}
            >
              AI
            </span>
          )}
        </button>
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: minimized ? "280px" : "360px",
            height: minimized ? "auto" : "540px",
            background: dark ? "#161b22" : "#ffffff",
            border: `1px solid ${dark ? "#2d3348" : "#d0d7de"}`,
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            animation: "chatSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #4f6ef7 0%, #6d28d9 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Scale size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-none">LegalEase AI</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white/70 text-[11px]">
                  {currentPage ? `${currentPage} page` : "Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMin(!minimized)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {minimized ? <Maximize2 size={12} className="text-white" /> : <Minimize2 size={12} className="text-white" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Page context badge */}
              {currentPage && (
                <div
                  className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2 flex-shrink-0"
                  style={{ background: dark ? "#1c2230" : "#f0f4ff", border: `1px solid ${dark ? "#2d3348" : "#c7d0ff"}` }}
                >
                  <FileText size={11} style={{ color: "#4f6ef7", flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: dark ? "#8b949e" : "#57606a" }}>
                    {pageContext
                      ? `Context loaded — I can explain what you're viewing`
                      : `Ask me about the ${currentPage} page or upload a document below`}
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} dark={dark} />
                ))}
                {loading && <TypingIndicator dark={dark} />}
                <div ref={bottomRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && analysisResult && (
                <div className="px-3 pb-2 flex flex-col gap-1.5 flex-shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider px-1" style={{ color: dark ? "#484f58" : "#8c959f" }}>
                    Quick questions
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="text-left px-3 py-2 rounded-xl text-[11px] font-medium transition-all hover:opacity-80"
                        style={{
                          background: dark ? "#1c2230" : "#f0f4ff",
                          color: dark ? "#8b949e" : "#57606a",
                          border: `1px solid ${dark ? "#2d3348" : "#c7d0ff"}`,
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div
                className="px-3 pb-3 flex-shrink-0"
                style={{ borderTop: `1px solid ${dark ? "#2d3348" : "#e8ecf0"}` }}
              >
                <div
                  className="flex items-end gap-2 mt-3 rounded-xl px-3 py-2"
                  style={{
                    background: dark ? "#1c2230" : "#f6f8fa",
                    border: `1px solid ${dark ? "#2d3348" : "#d0d7de"}`,
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={pageContext ? "Ask about this document or page…" : "Ask about legal concepts, this page…"}
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-[13px] leading-relaxed"
                    style={{ color: dark ? "#e6edf3" : "#1c2128", maxHeight: "80px" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    style={{
                      background: input.trim() && !loading
                        ? "linear-gradient(135deg, #4f6ef7, #6d28d9)"
                        : dark ? "#2d3348" : "#e0e4ea",
                      opacity: input.trim() && !loading ? 1 : 0.5,
                    }}
                  >
                    {loading
                      ? <Loader2 size={13} className="text-white animate-spin" />
                      : <Send size={13} className="text-white" />}
                  </button>
                </div>
                <p className="text-[10px] text-center mt-1.5" style={{ color: dark ? "#484f58" : "#8c959f" }}>
                  Powered by LLaMA 3.1 · Not legal advice
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
    </div>
  );
}