// ─── useSession.js ────────────────────────────────────────────────────────────
// Reads the logged-in user from the server session via GET /api/auth/me.
// The session cookie is the source of truth — localStorage only ever held the
// user_id and says nothing about the role, so it cannot be trusted for routing.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { success: false }))
      .then((data) => {
        if (cancelled) return;
        setUser(data.success ? data.user : null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}

export default useSession;
