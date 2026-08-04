// ─── RecentCourses.jsx ──────────────────────────────────────────────────────
// Card containing the courses table, backed by GET /api/admin/recent-courses.
// Shows courses rather than individual registrations — the course list stays
// roughly bounded in size as the student base grows, unlike a registrations
// table which grows with every enrollment.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import CourseRow from "./CourseRow";
import styles from "./RecentCourses.module.css";

// Clicking the "Status" header cycles through pinning each status to the
// top of the table, then back to the default (most-recent-first) order.
// Inactive courses are excluded from this table entirely, so only these
// two statuses ever show up here.
const STATUS_SORT_CYCLE = [null, "Active", "Upcoming"];

function RecentCourses() {
  const [courses, setCourses] = useState([]);
  const [statusSort, setStatusSort] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/recent-courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.courses);
      })
      .catch(() => {
        // non-blocking: the table just stays empty
      });
  }, []);

  const sortedCourses = useMemo(() => {
    if (!statusSort) return courses;
    // stable sort: groups the picked status at the top, keeping every
    // group's original (start-date-descending) relative order intact
    return [...courses].sort((a, b) => {
      const aMatch = a.status === statusSort;
      const bMatch = b.status === statusSort;
      if (aMatch === bMatch) return 0;
      return aMatch ? -1 : 1;
    });
  }, [courses, statusSort]);

  const cycleStatusSort = () => {
    const nextIndex =
      (STATUS_SORT_CYCLE.indexOf(statusSort) + 1) % STATUS_SORT_CYCLE.length;
    setStatusSort(STATUS_SORT_CYCLE[nextIndex]);
  };

  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Courses</h2>
        <button
          className={styles.viewAll}
          type="button"
          onClick={() => navigate("/admin/courses")}
        >
          View All &rsaquo;
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th
                className={styles.sortableHeader}
                onClick={cycleStatusSort}
                title="Click to sort by status"
              >
                Status
                <ArrowUpDown size={12} className={styles.sortIcon} />
                {statusSort && (
                  <span className={styles.sortActive}>({statusSort})</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCourses.map((c) => (
              <CourseRow key={c.course_id} {...c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentCourses;
