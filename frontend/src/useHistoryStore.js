/**
 * useHistoryStore.js — Supabase-synced analysis history
 * Falls back to localStorage if backend is unavailable.
 */
import { useState, useCallback, useEffect, useRef } from "react";

const API_BASE = "/api";

// ── localStorage fallback ─────────────────────────────────────────────────────
const LS_KEY = (email) => `legalease_history_${email?.toLowerCase().trim() || "guest"}`;
function lsLoad(email)       { try { return JSON.parse(localStorage.getItem(LS_KEY(email)) || "[]"); } catch { return []; } }
function lsSave(email, data) { try { localStorage.setItem(LS_KEY(email), JSON.stringify(data)); } catch {} }
function lsClear(email)      { try { localStorage.removeItem(LS_KEY(email)); } catch {} }

// ── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(path, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Strip result down before sending to Supabase (keep it small) ──────────────
// The full result object can be very large (100KB+). We store only what
// the History page detail panel actually needs to display.
function slimResult(result) {
  if (!result) return null;
  return {
    summary:     result.summary     || "",
    riskScore:   result.riskScore   ?? result.risk_score ?? null,
    riskLabel:   result.riskLabel   || result.risk_level || null,
    pros:        (result.pros        || []).slice(0, 20),
    cons:        (result.cons        || []).slice(0, 20),
    legal_terms: (result.legal_terms || []).slice(0, 20),
    clauses:     (result.clauses     || []).slice(0, 30),
  };
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useHistoryStore(userEmail, token) {
  const [history,   setHistoryRaw] = useState([]);
  const [syncing,   setSyncing]    = useState(false);
  const [backendOk, setBackendOk]  = useState(true);
  const initialised = useRef(false);

  // ── Load on login ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userEmail) { setHistoryRaw([]); initialised.current = false; return; }

    const cached = lsLoad(userEmail);
    setHistoryRaw(cached);

    if (!token) return;

    setSyncing(true);
    apiFetch("/history/analysis", "GET", null, token)
      .then(data => {
        const remote   = data.entries || [];
        const remoteIds = new Set(remote.map(e => String(e.id)));
        const localOnly = cached.filter(e => !remoteIds.has(String(e.id)));
        const merged    = [...localOnly, ...remote];
        setHistoryRaw(merged);
        lsSave(userEmail, merged);
        setBackendOk(true);
        initialised.current = true;
        // Push local-only entries to backend
        localOnly.forEach(entry => {
          const payload = { ...entry, result: slimResult(entry.result) };
          apiFetch("/history/analysis", "POST", payload, token)
            .catch(e => console.warn("[history] push local entry failed:", e.message));
        });
      })
      .catch(e => {
        console.warn("[history] backend unavailable, using localStorage:", e.message);
        setBackendOk(false);
        initialised.current = true;
      })
      .finally(() => setSyncing(false));
  }, [userEmail, token]);

  // ── setHistory (local only) ───────────────────────────────────────────────
  const setHistory = useCallback((updater) => {
    setHistoryRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      lsSave(userEmail, next);
      return next;
    });
  }, [userEmail]);

  // ── addEntry ──────────────────────────────────────────────────────────────
  const addEntry = useCallback((entry) => {
    // Always update local state immediately
    setHistory(prev => [entry, ...prev]);

    if (!token) return;

    // Send slim version to backend (strips huge result object down)
    const payload = {
      id:         entry.id,
      name:       entry.name,
      size:       entry.size,
      risk:       entry.risk,
      risk_score: entry.risk_score ?? entry.riskScore ?? null,
      depth:      entry.depth     || null,
      date:       entry.date,
      starred:    false,
      result:     slimResult(entry.result),
    };

    apiFetch("/history/analysis", "POST", payload, token)
      .then(() => { setBackendOk(true); console.log("[history] saved to Supabase ✓"); })
      .catch(e => {
        console.error("[history] save to Supabase failed:", e.message);
        // Don't set backendOk=false for a single entry failure
      });
  }, [setHistory, token]);

  // ── toggleStar ────────────────────────────────────────────────────────────
  const toggleStar = useCallback((id) => {
    setHistoryRaw(prev => {
      const next  = prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e);
      lsSave(userEmail, next);
      const entry = next.find(e => e.id === id);
      if (token && entry) {
        apiFetch(`/history/analysis/${id}/star`, "PATCH", { starred: entry.starred }, token)
          .catch(e => console.warn("[history] star update failed:", e.message));
      }
      return next;
    });
  }, [userEmail, token]);

  // ── deleteEntry ───────────────────────────────────────────────────────────
  const deleteEntry = useCallback((id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
    if (token) {
      apiFetch(`/history/analysis/${id}`, "DELETE", null, token)
        .catch(e => console.warn("[history] delete failed:", e.message));
    }
  }, [setHistory, token]);

  // ── clearHistory ──────────────────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    setHistoryRaw([]);
    lsClear(userEmail);
    if (token) {
      apiFetch("/history/all", "DELETE", null, token)
        .catch(e => console.warn("[history] clear all failed:", e.message));
    }
  }, [userEmail, token]);

  return { history, setHistory, addEntry, toggleStar, deleteEntry, clearHistory, syncing };
}