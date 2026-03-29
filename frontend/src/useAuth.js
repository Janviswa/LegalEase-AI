/**
 * useAuth.js  —  Lightweight JWT auth hook for LegalEase AI
 * ──────────────────────────────────────────────────────────
 * • Stores the JWT in localStorage → session survives page refresh
 * • Decodes payload client-side (read-only) to show user info in UI
 * • Backend ALWAYS verifies signature on every protected request
 * • Auto-logs out when the token's exp timestamp is reached
 */
import { useState, useEffect, useCallback } from "react";

const LS_KEY = "legalease_token";

/** Decode JWT payload without verifying signature (UI use only). */
function decodePayload(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const p = decodePayload(token);
  return !!p && p.exp * 1000 > Date.now();
}

function tokenToUser(token) {
  const p = decodePayload(token);
  if (!p) return null;
  return { id: p.sub, name: p.name, email: p.email, plan: p.plan };
}

export function useAuth() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem(LS_KEY);
    return isTokenValid(t) ? t : null;
  });

  const [user, setUser] = useState(() => {
    const t = localStorage.getItem(LS_KEY);
    return isTokenValid(t) ? tokenToUser(t) : null;
  });

  /** Call this after a successful /auth/login or /auth/register response. */
  const storeLogin = useCallback((jwt) => {
    localStorage.setItem(LS_KEY, jwt);
    setToken(jwt);
    setUser(tokenToUser(jwt));
  }, []);

  /** Clear the session (logout). */
  const clearLogin = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /** Auto-logout when the JWT expires. */
  useEffect(() => {
    if (!token) return;
    const p  = decodePayload(token);
    if (!p)   return;
    const ms = p.exp * 1000 - Date.now();
    if (ms <= 0) { clearLogin(); return; }
    const tid = setTimeout(clearLogin, ms);
    return () => clearTimeout(tid);
  }, [token, clearLogin]);

  /** Update the user's display name via the backend and refresh JWT. */
  const updateName = useCallback(async (newName, currentToken) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/auth/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to update name.");
    // Refresh the stored JWT so user.name updates everywhere
    storeLogin(data.token);
    return data;
  }, [storeLogin]);

  return { user, token, storeLogin, clearLogin, updateName, isLoggedIn: !!user };
}