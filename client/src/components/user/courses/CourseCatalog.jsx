// ─── CourseCatalog.jsx ────────────────────────────────────────────────────────
// /user/courses — every active course that hasn't started yet, with seats
// left and whether the logged-in user is already registered.
//
// Supports an optional ?level=beginner|intermediate|advanced query param —
// the dashboard's "no enrollment yet" promo cards link here with it set, so
// picking a plan lands the user on just that level instead of the full list.
//
// "Enroll now" first opens a confirmation modal (EnrollConfirmModal) showing
// every lesson date/time for the course, so the student can check it fits
// their schedule before paying anything. Only once they confirm there does
// the real PayPal flow kick off:
//   1. POST /api/courses/:id/paypal/create-order — creates a PayPal order and
//      a 10-minute "pending" reservation that holds the seat.
//   2. Redirect the whole page to PayPal's approve_link.
//   3. PayPal redirects back to /user/courses/:id/paypal/return, where
//      EnrollReturn captures the order and completes the registration.
//      If the user cancels instead, PayPal sends them back here with
//      ?cancelled=<course_id>, and the pending reservation is released.
//
// A course whose lessons overlap (same date, overlapping time) a lesson the
// user is already booked into comes back with a non-empty `clashes` list —
// its card shows which lessons clash and "Enroll" is disabled. The server
// blocks create-order in that case too (validateNoStudentScheduleClash).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import EnrollConfirmModal from "./EnrollConfirmModal";
import SeatsBar from "./SeatsBar";
import styles from "./CourseCatalog.module.css";
import { formatDate } from "../../../utils/formatDate";

// display order of the level sections — easiest first. Any level not listed
// here (shouldn't happen, but the DB doesn't enforce it) is appended after.
const LEVELS = [
  { key: "beginner", label: "Beginner", blurb: "First time on a board? Start here." },
  { key: "intermediate", label: "Intermediate", blurb: "Catching waves already — time to refine." },
  { key: "advanced", label: "Advanced", blurb: "Bigger waves and advanced manoeuvres." },
];

// groups courses into [{ key, label, blurb, courses }] in LEVELS order,
// skipping levels that have no courses
function groupByLevel(courses) {
  const groups = new Map(LEVELS.map((lvl) => [lvl.key, { ...lvl, courses: [] }]));

  courses.forEach((course) => {
    const key = (course.level || "other").toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { key, label: course.level || "Other", blurb: "", courses: [] });
    }
    groups.get(key).courses.push(course);
  });

  return [...groups.values()].filter((g) => g.courses.length > 0);
}

function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const levelFilter = searchParams.get("level");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  // the course currently shown in the "confirm before you pay" modal, or
  // null when it's closed
  const [confirmingCourse, setConfirmingCourse] = useState(null);

  // the one-time cancel request, kept across StrictMode's double effect so
  // both runs wait for it instead of firing it twice
  const releaseRef = useRef(null);

  useEffect(() => {
    // PayPal's cancel_url lands here with ?cancelled=<course_id> — release
    // the seat that checkout was holding before loading the list, so the
    // seat counts are correct
    const cancelledId = searchParams.get("cancelled");
    if (cancelledId && !releaseRef.current) {
      releaseRef.current = fetch(
        `/api/courses/${cancelledId}/paypal/cancel-order`,
        { method: "POST" },
      )
        .then(() => toast.info("Payment cancelled — you were not charged."))
        .catch(() => {});
      const next = new URLSearchParams(searchParams);
      next.delete("cancelled");
      next.delete("token");
      next.delete("PayerID");
      setSearchParams(next, { replace: true });
    }

    (releaseRef.current || Promise.resolve())
      .then(() => fetch("/api/courses/available"))
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load courses");
        }
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // mount-only: the ?cancelled param is consumed (and stripped) once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCourses = levelFilter
    ? courses.filter((c) => c.level.toLowerCase() === levelFilter.toLowerCase())
    : courses;

  const levelGroups = groupByLevel(visibleCourses);

  // per-level counts for the filter tabs, always based on the full list so
  // the tabs don't change when one of them is selected
  const levelCounts = courses.reduce((acc, c) => {
    const key = (c.level || "").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const handleEnroll = async (course) => {
    setEnrollingId(course.course_id);

    try {
      const res = await fetch(
        `/api/courses/${course.course_id}/paypal/create-order`,
        { method: "POST" },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not start checkout");
      }

      // full page redirect to PayPal — it sends the browser back to
      // /user/courses/:id/paypal/return once the user approves
      window.location.href = data.approve_link;
    } catch (err) {
      toast.error(err.message);
      setEnrollingId(null);
    }
  };

  // "Enroll now" opens the confirmation modal instead of paying straight
  // away — handleEnroll (the actual PayPal redirect) only runs once the
  // student reviews the lesson dates and clicks "Continue to PayPal".
  const handleEnrollClick = (course) => {
    setConfirmingCourse(course);
  };

  const handleConfirmEnroll = async () => {
    const course = confirmingCourse;
    await handleEnroll(course);
    // on success the page is about to navigate away to PayPal; on failure
    // handleEnroll already toasted the error, so just close the modal
    setConfirmingCourse(null);
  };

  if (loading) return <div className={styles.state}>Loading courses…</div>;
  if (error) return <div className={styles.stateError}>Error: {error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Course Catalog</h1>
        <p className={styles.subtitle}>
          {levelFilter ? (
            <>
              Showing <strong>{levelFilter}</strong> courses only —{" "}
              <Link to="/user/courses" className={styles.clearFilter}>
                show all levels
              </Link>
            </>
          ) : (
            "Browse upcoming courses and reserve your spot."
          )}
        </p>
      </div>

      {courses.length > 0 && (
        <nav className={styles.levelTabs} aria-label="Filter by level">
          <Link
            to="/user/courses"
            className={`${styles.levelTab} ${!levelFilter ? styles.levelTabActive : ""}`}
          >
            All <span className={styles.levelTabCount}>{courses.length}</span>
          </Link>
          {LEVELS.map((lvl) => (
            <Link
              key={lvl.key}
              to={`/user/courses?level=${lvl.key}`}
              className={`${styles.levelTab} ${styles[`tab_${lvl.key}`]} ${
                levelFilter?.toLowerCase() === lvl.key ? styles.levelTabActive : ""
              }`}
            >
              {lvl.label}{" "}
              <span className={styles.levelTabCount}>
                {levelCounts[lvl.key] || 0}
              </span>
            </Link>
          ))}
        </nav>
      )}

      {visibleCourses.length === 0 ? (
        <div className={styles.state}>
          {levelFilter
            ? `No ${levelFilter} courses are open for registration right now — check back soon.`
            : "No courses are open for registration right now — check back soon."}
        </div>
      ) : (
        levelGroups.map((group) => (
          <section
            key={group.key}
            className={`${styles.levelSection} ${styles[`level_${group.key}`] || ""}`}
          >
            <header className={styles.levelHeader}>
              <div>
                <h2 className={styles.levelTitle}>{group.label}</h2>
                {group.blurb && <p className={styles.levelBlurb}>{group.blurb}</p>}
              </div>
              <span className={styles.levelCount}>
                {group.courses.length} {group.courses.length === 1 ? "course" : "courses"}
              </span>
            </header>

            <div className={styles.grid}>
              {group.courses.map((course) => {
                const full = course.seats_left <= 0;
                const isEnrolling = enrollingId === course.course_id;
                // lessons overlapping one the user already has — the server
                // rejects create-order in that case too, this just says so
                // up front instead of after clicking
                const clashes = course.is_registered ? [] : course.clashes || [];
                const hasClash = clashes.length > 0;

                return (
                  <div key={course.course_id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span
                        className={`${styles.badge} ${styles.badgeLevel} ${
                          styles[`badge_${(course.level || "").toLowerCase()}`] || ""
                        }`}
                      >
                        {course.level}
                      </span>
                      {course.discount_percent != null && (
                        <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                          🔥 {course.discount_percent}% OFF
                        </span>
                      )}
                      {course.is_registered && (
                        <span
                          className={`${styles.badge} ${styles.badgeRegistered}`}
                        >
                          Registered
                        </span>
                      )}
                      {hasClash && (
                        <span className={`${styles.badge} ${styles.badgeClash}`}>
                          Schedule clash
                        </span>
                      )}
                    </div>

                    <h2 className={styles.cardTitle}>{course.description}</h2>

                    <dl className={styles.meta}>
                      <div className={styles.metaRow}>
                        <dt>Dates</dt>
                        <dd>
                          {formatDate(course.start_date)} – {formatDate(course.end_date)}
                        </dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt>Instructor</dt>
                        <dd>{course.instructor}</dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt>Lessons</dt>
                        <dd>{course.total_lessons}</dd>
                      </div>
                    </dl>

                    {hasClash && (
                      <div className={styles.clashNote} role="note">
                        <p>Overlaps a course you're already booked into:</p>
                        <ul>
                          {clashes.slice(0, 2).map((cl) => (
                            <li key={`${cl.lesson_number}-${cl.other_course_id}`}>
                              Lesson {cl.lesson_number} · {formatDate(cl.date)}{" "}
                              {cl.start_time}–{cl.end_time} clashes with "
                              {cl.other_course_description}" ({cl.other_start_time}–
                              {cl.other_end_time})
                            </li>
                          ))}
                          {clashes.length > 2 && (
                            <li>and {clashes.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <SeatsBar capacity={course.capacity} seatsLeft={course.seats_left} />

                    <div className={styles.priceRow}>
                      {/* course.price is already VAT-inclusive. When a
                          last-minute discount is active, final_price is what
                          PayPal actually charges — see applyDiscount() on the
                          server, used identically for the catalog, the PayPal
                          order amount, and the receipt email. */}
                      {course.discount_percent != null ? (
                        <>
                          <span className={styles.priceOriginal}>
                            ₪{course.price}
                          </span>
                          <span className={`${styles.price} ${styles.priceDiscounted}`}>
                            ₪{course.final_price}
                          </span>
                        </>
                      ) : (
                        <span className={styles.price}>₪{course.price}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`btn-primary ${styles.btnEnroll}`}
                      disabled={course.is_registered || full || hasClash || isEnrolling}
                      onClick={() => handleEnrollClick(course)}
                    >
                      {course.is_registered
                        ? "Already registered"
                        : full
                          ? "Course full"
                          : hasClash
                            ? "Schedule clash"
                            : isEnrolling
                            ? "Redirecting to PayPal…"
                            : "Enroll now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {confirmingCourse && (
        <EnrollConfirmModal
          course={confirmingCourse}
          submitting={enrollingId === confirmingCourse.course_id}
          onConfirm={handleConfirmEnroll}
          onClose={() => setConfirmingCourse(null)}
        />
      )}
    </div>
  );
}

export default CourseCatalog;
