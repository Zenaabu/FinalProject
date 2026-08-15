// ─── CourseCatalog.jsx ────────────────────────────────────────────────────────
// /user/courses — every active course that hasn't started yet, with seats
// left and whether the logged-in user is already registered.
//
// Supports an optional ?level=beginner|intermediate|advanced query param —
// the dashboard's "no enrollment yet" promo cards link here with it set, so
// picking a plan lands the user on just that level instead of the full list.
//
// Enrolling kicks off the real PayPal flow:
//   1. POST /api/courses/:id/paypal/create-order — creates a PayPal order and
//      a 10-minute "pending" reservation that holds the seat.
//   2. Redirect the whole page to PayPal's approve_link.
//   3. PayPal redirects back to /user/courses/:id/paypal/return, where
//      EnrollReturn captures the order and completes the registration.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import styles from "./CourseCatalog.module.css";

function CourseCatalog() {
  const [searchParams] = useSearchParams();
  const levelFilter = searchParams.get("level");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    fetch("/api/courses/available")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load courses");
        }
        setCourses(data.courses);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleCourses = levelFilter
    ? courses.filter((c) => c.level.toLowerCase() === levelFilter.toLowerCase())
    : courses;

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

      {visibleCourses.length === 0 ? (
        <div className={styles.state}>
          {levelFilter
            ? `No ${levelFilter} courses are open for registration right now — check back soon.`
            : "No courses are open for registration right now — check back soon."}
        </div>
      ) : (
        <div className={styles.grid}>
          {visibleCourses.map((course) => {
            const full = course.seats_left <= 0;
            const isEnrolling = enrollingId === course.course_id;

            return (
              <div key={course.course_id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={`${styles.badge} ${styles.badgeLevel}`}>
                    {course.level}
                  </span>
                  {course.is_registered && (
                    <span
                      className={`${styles.badge} ${styles.badgeRegistered}`}
                    >
                      Registered
                    </span>
                  )}
                </div>

                <h2 className={styles.cardTitle}>{course.description}</h2>

                <dl className={styles.meta}>
                  <div className={styles.metaRow}>
                    <dt>Dates</dt>
                    <dd>
                      {course.start_date} – {course.end_date}
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
                  <div className={styles.metaRow}>
                    <dt>Seats left</dt>
                    <dd>{course.seats_left} / {course.capacity}</dd>
                  </div>
                </dl>

                <div className={styles.priceRow}>
                  {/* course.price is already VAT-inclusive — it's exactly
                      what PayPal charges, so show it as one final price */}
                  <span className={styles.price}>₪{course.price}</span>
                </div>

                <button
                  type="button"
                  className={`btn-primary ${styles.btnEnroll}`}
                  disabled={course.is_registered || full || isEnrolling}
                  onClick={() => handleEnroll(course)}
                >
                  {course.is_registered
                    ? "Already registered"
                    : full
                      ? "Course full"
                      : isEnrolling
                        ? "Redirecting to PayPal…"
                        : "Enroll now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CourseCatalog;
