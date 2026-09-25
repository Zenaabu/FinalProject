// ─── InstructorLayout.jsx ─────────────────────────────────────────────────────
// Wrapper layout for all /instructor/* pages.
// Same shell as the admin panel, with the instructor's own navigation.
// Also fetches the instructor's upcoming substitute-lesson count once, so a
// red badge on "Substitute Lessons" is visible from every page — an
// instructor assigned to cover a lesson previously had no way to know unless
// they happened to click into that page on their own.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/sidebar/AdminSidebar";
import { INSTRUCTOR_NAV_ITEMS } from "./instructorNavConfig";
import { getSeenIds, SEEN_EVENT } from "./substitute/substituteSeen";
import styles from "./InstructorLayout.module.css";

function InstructorLayout() {
  const [upcomingSubstituteCount, setUpcomingSubstituteCount] = useState(0);

  useEffect(() => {
    let lessons = [];

    // the badge counts lessons that still need attention AND that the
    // instructor hasn't already opened the Substitute Lessons page for
    const recount = () => {
      const seen = getSeenIds();
      setUpcomingSubstituteCount(
        lessons.filter((l) => l.needs_attention && !seen.has(l.lesson_id))
          .length,
      );
    };

    fetch("/api/instructor/substitute-lessons")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        lessons = data.lessons;
        recount();
      })
      .catch(() => {
        // non-blocking: the badge just stays hidden
      });

    window.addEventListener(SEEN_EVENT, recount);
    return () => window.removeEventListener(SEEN_EVENT, recount);
  }, []);

  return (
    <div className={styles.layout}>
      <AdminSidebar
        subtitle="Instructor Panel"
        items={INSTRUCTOR_NAV_ITEMS}
        rootPath="/instructor"
        ariaLabel="Instructor navigation"
        badges={{ "substitute-lessons": upcomingSubstituteCount }}
      />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default InstructorLayout;
