// ─── AccessibilityWidget.jsx ──────────────────────────────────────────────────
// Loads the UserWay accessibility menu (floating icon: text size, contrast,
// readable font, ...) on the public site and the user portal, but not in the
// admin / instructor back offices.
//
// The script is added the first time the visitor lands on an allowed page.
// UserWay has no clean "unload", so if they then navigate into an excluded area
// (e.g. an admin logging in from the landing page) we reload once — the fresh
// page starts without the script, so the widget and any styles it applied are
// gone. Renders nothing.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SCRIPT_ID = "userway-widget";
const SCRIPT_SRC = "https://cdn.userway.org/widget.js";
const ACCOUNT_ID = "mA4gG6UUub";
const EXCLUDED_AREAS = ["/admin", "/instructor"];

function AccessibilityWidget() {
  const { pathname } = useLocation();
  const excluded = EXCLUDED_AREAS.some(
    (area) => pathname === area || pathname.startsWith(`${area}/`),
  );

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);

    if (excluded) {
      if (existing) window.location.reload();
      return;
    }
    if (existing) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.dataset.account = ACCOUNT_ID;
    script.async = true;
    document.body.appendChild(script);
  }, [excluded]);

  return null;
}

export default AccessibilityWidget;
