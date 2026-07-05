"use client";

import { useCallback, useRef, useState } from "react";

/** Small toast used for actions that don't have a real backend wired up yet
 * (e.g. "continue with Google" before Supabase Auth is configured). Once real
 * flows exist, replace the call sites with actual navigation / API calls. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, duration = 2000) => {
    setMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  const ToastView = (
    <div className={`rf-toast${message ? " show" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );

  return { show, ToastView };
}
