"use client";

export function getAuthEmail() {
  try {
    return (sessionStorage.getItem("currentUser") || "").trim();
  } catch {}
  try {
    return (localStorage.getItem("currentUser") || "").trim();
  } catch {}
  try {
    const m =
      typeof document === "undefined" ? null : document.cookie.match(/(?:^|;\s*)currentUser=([^;]+)/);
    return m ? decodeURIComponent(m[1] || "").trim() : "";
  } catch {}
  try {
    const name = typeof window === "undefined" ? "" : window.name || "";
    const m = name.match(/^currentUser=(.*)$/);
    return m ? decodeURIComponent(m[1] || "").trim() : "";
  } catch {}
  return "";
}

// JWT access token stored on the client (used for Authorization: Bearer).
export function getAuthToken() {
  try {
    return (sessionStorage.getItem("authToken") || "").trim();
  } catch {}
  try {
    return (localStorage.getItem("authToken") || "").trim();
  } catch {}
  return "";
}

// Persist login state and notify pages/components via a custom event.
export function setAuth(email: string, token: string) {
  const e = (email || "").trim();
  const t = (token || "").trim();
  try {
    sessionStorage.setItem("currentUser", e);
    sessionStorage.setItem("authToken", t);
  } catch {}
  try {
    localStorage.setItem("currentUser", e);
    localStorage.setItem("authToken", t);
  } catch {}
  try {
    document.cookie = `currentUser=${encodeURIComponent(e)}; path=/; SameSite=Lax`;
  } catch {}
  try {
    window.name = `currentUser=${encodeURIComponent(e)}`;
  } catch {}
  try {
    window.dispatchEvent(new Event("authchange"));
  } catch {}
}

// Clear login state and notify pages/components via a custom event.
export function clearAuth() {
  try {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
  } catch {}
  try {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
  } catch {}
  try {
    document.cookie = "currentUser=; path=/; max-age=0";
  } catch {}
  try {
    window.name = "";
  } catch {}
  try {
    window.dispatchEvent(new Event("authchange"));
  } catch {}
}

// React subscription helper for useSyncExternalStore.
export function subscribeAuth(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  window.addEventListener("authchange", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("authchange", cb);
  };
}

