"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (public/sw.js). Runs once on mount, client-side only.
 * Silently no-ops if the browser doesn't support service workers or if running over
 * plain HTTP in local dev on some browsers (HTTPS is required in production — Vercel
 * provides this by default). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
