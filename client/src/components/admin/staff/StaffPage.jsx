// ─── StaffPage.jsx ─────────────────────────────────────────────────────────
// /admin/staff — the dates instructors have marked as unavailable, sent from
// the instructor's Availability tab (POST /api/instructor/constraints).
//
// Pending -> admin hasn't decided yet (if the dates pass with no decision,
// that's functionally the same as rejected: the instructor is still
// expected to teach, nothing else has to happen).
// Rejected -> nothing to do, instructor still teaches.
// Approved -> the lessons that fall inside the date range need to be
// resolved one by one: assign a substitute instructor, or reschedule the
// lesson to a new date (lessons are never cancelled).
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, GraduationCap, AlertTriangle } from "lucide-react";
import AffectedLessonsPanel from "./AffectedLessonsPanel";
import ApproveConflictModal from "./ApproveConflictModal";
import InstructorCoursesModal from "./InstructorCoursesModal";
import StaffDateRangeForm, { currentMonthRange } from "./StaffDateRangeForm";
import styles from "./StaffPage.module.css";

// true when the constraint's own [start_date, end_date] span overlaps
// [start, end] at all — same overlap rule CourseManagerDashboard uses for
// its own date-range search, for consistency across the admin panel
function overlapsDateRange(constraint, start, end) {
  if (start && constraint.end_date < start) return false;
  if (end && constraint.start_date > end) return false;
  return true;
}

function formatRangeLabel(startDate, endDate) {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    opts,
  );
  if (startDate === endDate) return start;
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    opts,
  );
  return `${start} – ${end}`;
}

function StaffPage() {
  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decidingId, setDecidingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [checkingId, setCheckingId] = useState(null);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalLessons, setApprovalLessons] = useState(null);
  const [coursesTarget, setCoursesTarget] = useState(null);

  // The admin shouldn't have to look through every request ever submitted
  // by default — just this month's, with a date-range search to go back.
  const [range, setRange] = useState(currentMonthRange);

  const visibleConstraints = useMemo(
    () =>
      constraints.filter((c) =>
        overlapsDateRange(c, range.startDate, range.endDate),
      ),
    [constraints, range],
  );

  useEffect(() => {
    fetch("/api/admin/instructor-constraints")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load constraints");
        }
        setConstraints(data.constraints);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch("/api/admin/instructors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstructors(data.instructors);
      });
  }, []);

  // Keeps a constraint row's "still needs attention" badge in sync as the
  // admin resolves its affected lessons one by one inside the expanded
  // panel, instead of only refreshing on a full page reload. Stable
  // identity (empty deps + functional update) on purpose — see the
  // matching comment in AffectedLessonsPanel.jsx.
  const handleResolvedCountChange = useCallback((constraints_id, count) => {
    setConstraints((prev) =>
      prev.map((c) =>
        c.constraints_id === constraints_id
          ? { ...c, unresolved_lesson_count: count }
          : c,
      ),
    );
  }, []);

  function decide(constraints_id, status) {
    setDecidingId(constraints_id);

    fetch(`/api/admin/instructor-constraints/${constraints_id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          toast.error(data.message || "Failed to update constraint");
          return;
        }
        setConstraints((prev) =>
          prev.map((c) =>
            c.constraints_id === constraints_id ? { ...c, status } : c,
          ),
        );
        toast.success(`Constraint ${status}`);
        if (status === "approved") setExpandedId(constraints_id);
      })
      .catch(() => toast.error("Failed to update constraint"))
      .finally(() => {
        setDecidingId(null);
        setApprovalTarget(null);
        setApprovalLessons(null);
      });
  }

  // before actually approving, check whether this date range overlaps
  // lessons the instructor is scheduled to teach — if it does, show the same
  // conflict warning the instructor sees before submitting, so the admin
  // knows what they're taking on before committing to the decision
  function handleApproveClick(c) {
    setCheckingId(c.constraints_id);

    fetch(`/api/admin/instructor-constraints/${c.constraints_id}/affected-lessons`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to check the instructor's schedule");
        }
        if (data.lessons.length > 0) {
          setApprovalTarget(c);
          setApprovalLessons(data.lessons);
        } else {
          decide(c.constraints_id, "approved");
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCheckingId(null));
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Staff Scheduling</h1>
      <p className={styles.subtitle}>
        Dates instructors have reported they can't teach. Showing{" "}
        {formatRangeLabel(range.startDate, range.endDate)}.
      </p>

      <StaffDateRangeForm
        startDate={range.startDate}
        endDate={range.endDate}
        onApply={(startDate, endDate) => setRange({ startDate, endDate })}
      />

      {loading && <div className={styles.state}>Loading…</div>}
      {error && <div className={styles.stateError}>Error: {error}</div>}

      {!loading && !error && constraints.length === 0 && (
        <div className={styles.state}>No constraints reported yet.</div>
      )}

      {!loading &&
        !error &&
        constraints.length > 0 &&
        visibleConstraints.length === 0 && (
          <div className={styles.state}>
            No requests between {range.startDate} and {range.endDate}. Search
            a different range to see older requests.
          </div>
        )}

      {!loading && !error && visibleConstraints.length > 0 && (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th />
                  <th>Instructor</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleConstraints.map((c) => {
                  const isExpanded = expandedId === c.constraints_id;
                  const isPastUnanswered =
                    c.status === "pending" &&
                    c.end_date < new Date().toISOString().slice(0, 10);

                  return (
                    <Fragment key={c.constraints_id}>
                      <tr className={styles.row}>
                        <td>
                          {c.status === "approved" && (
                            <button
                              type="button"
                              className={styles.expandBtn}
                              onClick={() =>
                                setExpandedId(isExpanded ? null : c.constraints_id)
                              }
                              aria-label="Toggle affected lessons"
                            >
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          )}
                        </td>
                        <td className={styles.name}>{c.instructor_name}</td>
                        <td className={styles.dates}>
                          {c.start_date === c.end_date
                            ? c.start_date
                            : `${c.start_date} → ${c.end_date}`}
                        </td>
                        <td className={styles.notes}>{c.notes}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${styles[`badge${c.status[0].toUpperCase()}${c.status.slice(1)}`]}`}
                          >
                            {c.status}
                          </span>
                          {isPastUnanswered && (
                            <span className={styles.pastHint}>
                              date passed, no decision
                            </span>
                          )}
                          {c.status === "approved" &&
                            c.unresolved_lesson_count > 0 && (
                              <button
                                type="button"
                                className={styles.unresolvedHint}
                                onClick={() =>
                                  setExpandedId(
                                    isExpanded ? null : c.constraints_id,
                                  )
                                }
                              >
                                <AlertTriangle size={12} />
                                {c.unresolved_lesson_count}{" "}
                                {c.unresolved_lesson_count === 1
                                  ? "lesson"
                                  : "lessons"}{" "}
                                still need a decision
                              </button>
                            )}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.btnCourses}
                              onClick={() => setCoursesTarget(c)}
                              title="View teaching courses"
                              aria-label={`View courses taught by ${c.instructor_name}`}
                            >
                              <GraduationCap size={14} />
                            </button>
                            {c.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  className={styles.btnApprove}
                                  disabled={
                                    decidingId === c.constraints_id ||
                                    checkingId === c.constraints_id
                                  }
                                  onClick={() => handleApproveClick(c)}
                                >
                                  {checkingId === c.constraints_id
                                    ? "Checking…"
                                    : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  className={styles.btnReject}
                                  disabled={decidingId === c.constraints_id}
                                  onClick={() => decide(c.constraints_id, "rejected")}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className={styles.panelCell}>
                            <AffectedLessonsPanel
                              constraintsId={c.constraints_id}
                              originalInstructorId={c.user_id}
                              instructors={instructors}
                              onResolvedCountChange={(count) =>
                                handleResolvedCountChange(
                                  c.constraints_id,
                                  count,
                                )
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {approvalTarget && (
        <ApproveConflictModal
          instructorName={approvalTarget.instructor_name}
          lessons={approvalLessons}
          startDate={approvalTarget.start_date}
          endDate={approvalTarget.end_date}
          submitting={decidingId === approvalTarget.constraints_id}
          onGoBack={() => {
            setApprovalTarget(null);
            setApprovalLessons(null);
          }}
          onApproveAnyway={() => decide(approvalTarget.constraints_id, "approved")}
        />
      )}

      {coursesTarget && (
        <InstructorCoursesModal
          instructor={{
            user_id: coursesTarget.user_id,
            instructor_name: coursesTarget.instructor_name,
          }}
          onClose={() => setCoursesTarget(null)}
        />
      )}
    </div>
  );
}

export default StaffPage;
