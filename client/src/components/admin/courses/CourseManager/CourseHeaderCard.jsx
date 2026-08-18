// ─── CourseHeaderCard.jsx ─────────────────────────────────────────────────────
// Accordion card for a single course. Clicking the header toggles the
// lesson list below. Each course in the dashboard renders one of these.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import LessonAccordionList from "./LessonAccordionList";
import CourseEditDrawer from "./CourseEditDrawer";
import styles from "./CourseHeaderCard.module.css";

/* ── Inline SVG icons ────────────────────────────────────────────────────── */
function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* ── Badge variant map ───────────────────────────────────────────────────── */
const STATUS_BADGE = {
  active: "badgeActive",
  upcoming: "badgeUpcoming",
  inactive: "badgeInactive",
};

function CourseHeaderCard({
  course,
  instructors,
  onCourseUpdated,
  onLessonsChanged,
  startExpanded = false,
}) {
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const cardRef = useRef(null);

  // Arriving here from the dashboard's "click a course" shortcut — scroll
  // it into view since the list is start-date-descending and the target
  // course might be well below the fold.
  useEffect(() => {
    if (startExpanded) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => setIsExpanded((prev) => !prev);

  const statusKey = course.status.toLowerCase();
  const statusClass = styles[STATUS_BADGE[statusKey] ?? "badgeActive"];

  // same "under 50% capacity" problem the dashboard's KPI counts, surfaced
  // per course here — only for courses that haven't started yet, since once
  // a course is already running its capacity isn't something the admin can
  // still act on
  const isUnderCapacity =
    statusKey === "upcoming" &&
    Number(course.capacity) > 0 &&
    Number(course.enrolled) < Number(course.capacity) * 0.5;

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}
    >
      {/* ── Clickable toggle area (title row + details row) ─────────── */}
      <div
        className={styles.toggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggle}
        onKeyDown={(e) => e.key === "Enter" && toggle()}
      >
        {/* Row 1: chevron · title · badges · edit */}
        <div className={styles.topRow}>
          <ChevronIcon expanded={isExpanded} />
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>{course.title}</h2>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${statusClass}`}>
                {course.status.toUpperCase()}
              </span>
              <span className={`${styles.badge} ${styles.badgeLevel}`}>
                {course.level}
              </span>
              {isUnderCapacity && (
                <span className={`${styles.badge} ${styles.badgeUnderCapacity}`}>
                  <WarningIcon />
                  Under 50% Capacity
                </span>
              )}
            </div>
          </div>
          <button
            className={styles.btnEdit}
            type="button"
            aria-label="Edit course"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
          >
            <PencilIcon />
          </button>
        </div>

        {/* Row 2: date · schedule · instructor · enrollment */}
        <div className={styles.detailsRow}>
          <span className={styles.detail}>
            <CalendarIcon />
            {course.start_date} – {course.end_date}
          </span>
          <span className={styles.detail}>
            <ClockIcon />
            {course.schedule}
          </span>
          <span className={styles.detail}>
            <UserIcon />
            {course.instructor}
          </span>
          <span className={styles.detail}>
            <PeopleIcon />
            {course.enrolled} / {course.capacity} enrolled
          </span>
        </div>
      </div>

      {/* ── Expandable lesson list ─────────────────────────────────── */}
      {isExpanded && (
        <LessonAccordionList
          lessons={course.lessons}
          courseId={course.course_id}
          courseInstructor={course.instructor}
          onLessonsChanged={onLessonsChanged}
          nested
        />
      )}

      {/* ── Edit drawer (fixed, slides in from right) ─────────────── */}
      {isEditOpen && (
        <CourseEditDrawer
          course={course}
          instructors={instructors}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updated) => {
            onCourseUpdated?.(updated);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default CourseHeaderCard;
