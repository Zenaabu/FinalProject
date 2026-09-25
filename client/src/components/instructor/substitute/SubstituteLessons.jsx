// ─── SubstituteLessons.jsx ────────────────────────────────────────────────────
// /instructor/substitute-lessons
// Lessons the logged-in instructor was assigned to cover for another
// instructor (admin resolved a time-off request with "assign substitute"
// on that lesson, see AffectedLessonsPanel on the admin side). These are not
// courses this instructor owns, so they don't show up under "My Courses" —
// this is the one place they see "you're covering this".
//
//   GET /api/instructor/substitute-lessons -> [{ lesson_id, course_id,
//     course_description, lesson_number, lesson_date, start_time, end_time,
//     original_instructor_name, can_take_attendance }]
//
// Picking a lesson goes to /instructor/substitute-lessons/:lesson_id, where
// attendance for just that one lesson is taken.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { markSeen } from "./substituteSeen";
import styles from "./SubstituteLessons.module.css";

// Lessons are split into "Upcoming" (soonest first — what the instructor
// needs to act on) and "Past" (newest first). Past is capped so a long
// history never buries the page; the rest sits behind "Show older".
const PAST_PAGE_SIZE = 6;

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const EMPTY_MESSAGE = {
  upcoming: "No upcoming lessons to cover.",
  past: "No past substitute lessons yet.",
};

function hasEnded(lesson) {
  return new Date(`${lesson.lesson_date}T${lesson.end_time}:00`) < new Date();
}

function byStart(a, b) {
  return `${a.lesson_date} ${a.start_time}`.localeCompare(
    `${b.lesson_date} ${b.start_time}`,
  );
}

function SubstituteLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [pastShown, setPastShown] = useState(PAST_PAGE_SIZE);

  useEffect(() => {
    fetch("/api/instructor/substitute-lessons")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(
            data.message || "Failed to load your substitute lessons",
          );
        }
        setLessons(data.lessons);
        // opening this page counts as seeing them — clears the sidebar badge
        markSeen(data.lessons.map((l) => l.lesson_id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, past } = useMemo(() => {
    const done = lessons.filter(hasEnded);
    return {
      upcoming: lessons.filter((l) => !hasEnded(l)).sort(byStart),
      past: done.sort((a, b) => byStart(b, a)),
    };
  }, [lessons]);

  const counts = { upcoming: upcoming.length, past: past.length };
  const visible = tab === "upcoming" ? upcoming : past.slice(0, pastShown);

  if (loading) return <div className={styles.state}>Loading…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Substitute Lessons</h1>
        <p className={styles.subtitle}>
          Lessons another instructor couldn't teach, that an admin assigned you
          to cover.
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className={styles.state}>
          You're not covering any lessons right now.
        </div>
      ) : (
        <>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Filter substitute lessons"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className={styles.tabCount}>{counts[t.key]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className={styles.state}>{EMPTY_MESSAGE[tab]}</div>
          ) : (
            <div className={styles.grid}>
              {visible.map((lesson) => (
                <Link
                  key={lesson.lesson_id}
                  to={`/instructor/substitute-lessons/${lesson.lesson_id}`}
                  className={styles.card}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.badge}>
                      Covering for {lesson.original_instructor_name}
                    </span>
                    {!lesson.can_take_attendance && (
                      <span className={styles.badgeMuted}>Not open yet</span>
                    )}
                  </div>

                  <h2 className={styles.cardTitle}>
                    {lesson.course_description}
                  </h2>

                  <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                      <dt>Lesson</dt>
                      <dd>{lesson.lesson_number}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Date</dt>
                      <dd>{lesson.lesson_date}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Time</dt>
                      <dd>
                        {lesson.start_time}–{lesson.end_time}
                      </dd>
                    </div>
                  </dl>

                  <span className={styles.cta}>
                    {tab === "past" ? "View attendance →" : "Take attendance →"}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {tab === "past" && past.length > pastShown && (
            <button
              type="button"
              className={styles.showMore}
              onClick={() => setPastShown((n) => n + PAST_PAGE_SIZE)}
            >
              Show older ({past.length - pastShown} more)
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SubstituteLessons;
