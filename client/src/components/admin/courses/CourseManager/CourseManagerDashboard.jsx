// ─── CourseManagerDashboard.jsx ───────────────────────────────────────────────
// Renders the vertical accordion course view, split by status into an
// All / Active / Inactive tab filter (an "Active"/"Upcoming" course counts as
// Active — both mean is_active = 1 on the course row; only a course the
// backend has flipped to is_active = 0, i.e. status "Inactive", counts
// against the Inactive tab).
// A date-range search narrows the same list further — a course matches when
// its own [start_date, end_date] span overlaps the searched range at all, so
// e.g. a course running Jan 10–Feb 20 still shows up for a Feb 1–Feb 10
// search even though it started before that range. Both filters combine.
// The course data itself is owned by CoursesMain so that creating or editing a
// course can refresh this list.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import CourseHeaderCard from "./CourseHeaderCard";
import styles from "./CourseManagerDashboard.module.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const EMPTY_MESSAGE = {
  all: "No courses found.",
  active: "No active courses right now.",
  inactive: "No inactive courses — nothing has finished yet.",
};

// true when the course's own date span overlaps [start, end] at all — an
// empty start or end means that side of the range is unbounded
function overlapsDateRange(course, start, end) {
  if (start && course.end_date < start) return false;
  if (end && course.start_date > end) return false;
  return true;
}

function CourseManagerDashboard({
  courses,
  instructors,
  loading,
  error,
  onCourseUpdated,
  onLessonsChanged,
  initialExpandedCourseId = null,
}) {
  const [filter, setFilter] = useState("all");

  // draft values follow the inputs as the admin types; appliedRange only
  // updates on Search, so the list doesn't jump around mid-edit
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [appliedRange, setAppliedRange] = useState(null);

  const rangeError =
    draftStart && draftEnd && draftEnd < draftStart
      ? "End date must be after start date"
      : null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (rangeError || (!draftStart && !draftEnd)) return;
    setAppliedRange({ start: draftStart, end: draftEnd });
  };

  const handleClear = () => {
    setDraftStart("");
    setDraftEnd("");
    setAppliedRange(null);
  };

  const counts = useMemo(() => {
    const inactive = courses.filter((c) => c.status === "Inactive").length;
    return {
      all: courses.length,
      active: courses.length - inactive,
      inactive,
    };
  }, [courses]);

  const visibleCourses = useMemo(() => {
    let list = courses;

    if (filter === "active") {
      list = list.filter((c) => c.status !== "Inactive");
    } else if (filter === "inactive") {
      list = list.filter((c) => c.status === "Inactive");
    }

    if (appliedRange) {
      list = list.filter((c) =>
        overlapsDateRange(c, appliedRange.start, appliedRange.end),
      );
    }

    return list;
  }, [courses, filter, appliedRange]);

  if (loading) {
    return <div className={styles.state}>Loading courses…</div>;
  }

  if (error) {
    return <div className={styles.stateError}>Error: {error}</div>;
  }

  if (courses.length === 0) {
    return <div className={styles.state}>No courses found.</div>;
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Toolbar: status tabs + date-range search ───────────────────── */}
      <div className={styles.toolbar}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Filter courses by status"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        <form
          className={styles.dateSearch}
          onSubmit={handleSearch}
          aria-label="Search courses by date range"
        >
          <label className={styles.dateField}>
            <span className={styles.dateLabel}>From</span>
            <input
              type="date"
              className={styles.dateInput}
              value={draftStart}
              max={draftEnd || undefined}
              onChange={(e) => setDraftStart(e.target.value)}
            />
          </label>

          <label className={styles.dateField}>
            <span className={styles.dateLabel}>To</span>
            <input
              type="date"
              className={styles.dateInput}
              value={draftEnd}
              min={draftStart || undefined}
              onChange={(e) => setDraftEnd(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className={styles.searchBtn}
            disabled={Boolean(rangeError) || (!draftStart && !draftEnd)}
          >
            <Search size={15} />
            Search
          </button>

          {appliedRange && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
            >
              <X size={13} />
              Clear
            </button>
          )}
        </form>
      </div>

      {rangeError && <p className={styles.dateError}>{rangeError}</p>}

      {/* ── Course list (filtered) ───────────────────────────────────── */}
      {visibleCourses.length === 0 ? (
        <div className={styles.state}>
          {appliedRange
            ? `No courses found between ${appliedRange.start || "…"} and ${appliedRange.end || "…"}.`
            : EMPTY_MESSAGE[filter]}
        </div>
      ) : (
        visibleCourses.map((course) => (
          <CourseHeaderCard
            key={course.course_id}
            course={course}
            instructors={instructors}
            onCourseUpdated={onCourseUpdated}
            onLessonsChanged={onLessonsChanged}
            startExpanded={course.course_id === initialExpandedCourseId}
          />
        ))
      )}
    </div>
  );
}

export default CourseManagerDashboard;
