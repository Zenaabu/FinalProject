// ─── InstructorConstraints.jsx ────────────────────────────────────────────────
// Lets the logged-in instructor tell the admin about dates they can't teach.
// Posts to /api/instructor/constraints (start_time/end_time are DATETIME
// columns, so a whole-day range is sent as startDate 00:00:00 → endDate
// 23:59:59). Also lists the requests this instructor already sent, fetched
// from GET /api/instructor/constraints.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Stethoscope,
  Users,
  Plane,
  MessageSquare,
  Send,
  CalendarDays,
} from "lucide-react";
import useSession from "../../auth/useSession";
import LessonConflictModal from "./LessonConflictModal";
import styles from "./InstructorConstraints.module.css";

const REASONS = [
  {
    id: "medical",
    label: "Medical Appointment",
    icon: Stethoscope,
  },
  {
    id: "family",
    label: "Family Event",
    icon: Users,
  },
  {
    id: "vacation",
    label: "Vacation / Travel",
    icon: Plane,
  },
  {
    id: "other",
    label: "Other",
    icon: MessageSquare,
  },
];

const REASON_LABELS = Object.fromEntries(REASONS.map((r) => [r.id, r.label]));

// the earliest date the backend will accept for start_time (today is
// rejected because it compares against the current moment, not just the date)
function tomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function InstructorConstraints() {
  const minDate = tomorrowDate();
  const { user } = useSession();

  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(minDate);
  const [reason, setReason] = useState("medical");
  const [otherText, setOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [formError, setFormError] = useState(null);
  const [conflictLessons, setConflictLessons] = useState(null);

  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  function loadConstraints() {
    setLoading(true);
    fetch("/api/instructor/constraints")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load your requests");
        }
        setConstraints(data.constraints);
      })
      .catch((err) => setListError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConstraints();
  }, []);

  const notes = reason === "other" ? otherText.trim() : REASON_LABELS[reason];
  const canSubmit =
    startDate && endDate && endDate >= startDate && notes.length > 0;

  // actually POSTs the request — called directly when there's no schedule
  // conflict, or from the conflict modal's "submit anyway" button
  function submitRequest() {
    setSubmitting(true);
    setFormError(null);

    fetch("/api/instructor/constraints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_time: `${startDate} 00:00:00`,
        end_time: `${endDate} 23:59:59`,
        notes,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setFormError(data.message);
          return;
        }
        toast.success("Sent to the admin.");
        setConflictLessons(null);
        setReason("medical");
        setOtherText("");
        setStartDate(minDate);
        setEndDate(minDate);
        loadConstraints();
      })
      .catch(() => setFormError("Failed to send request"))
      .finally(() => setSubmitting(false));
  }

  // before sending, check whether this date range overlaps lessons the
  // instructor is scheduled to teach — if it does, warn them first instead
  // of submitting straight away
  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || submitting || checkingConflicts) return;

    setFormError(null);
    setCheckingConflicts(true);

    fetch(
      `/api/instructor/constraints/lessons-in-range?start_date=${startDate}&end_date=${endDate}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to check your schedule");
        }
        if (data.lessons.length > 0) {
          setConflictLessons(data.lessons);
        } else {
          submitRequest();
        }
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setCheckingConflicts(false));
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Availability</h1>
        <p className={styles.subtitle}>
          Let the admin know about dates you can't teach.
        </p>
      </div>

      <div className={styles.layout}>
        {/* ── Form card ──────────────────────────────────────────────── */}
        <form className={styles.card} onSubmit={handleSubmit}>
          <h2 className={styles.cardTitle}>New time-off request</h2>

          <div className={styles.dateRow}>
            <label className={styles.dateField}>
              <span className={styles.fieldLabel}>
                <CalendarDays size={14} /> From
              </span>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                min={minDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                required
              />
            </label>

            <label className={styles.dateField}>
              <span className={styles.fieldLabel}>
                <CalendarDays size={14} /> To
              </span>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
          </div>

          <span className={styles.fieldLabel}>Reason</span>
          <div className={styles.reasonGrid}>
            {REASONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.reasonCard} ${
                  reason === id ? styles.reasonCardActive : ""
                }`}
                onClick={() => setReason(id)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {reason === "other" && (
            <textarea
              className={styles.textarea}
              placeholder="Tell the admin why you can't teach on these dates…"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value.slice(0, 500))}
              rows={3}
              required
            />
          )}

          {formError && <p className={styles.formError}>{formError}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit || submitting || checkingConflicts}
          >
            <Send size={16} />
            {checkingConflicts
              ? "Checking your schedule…"
              : submitting
                ? "Sending…"
                : "Send to admin"}
          </button>
        </form>

        {/* ── History card ───────────────────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Your requests</h2>

          {loading && <p className={styles.state}>Loading…</p>}
          {listError && <p className={styles.formError}>{listError}</p>}

          {!loading && !listError && constraints.length === 0 && (
            <p className={styles.state}>
              You haven't sent any requests yet.
            </p>
          )}

          {!loading && constraints.length > 0 && (
            <ul className={styles.historyList}>
              {constraints.map((c) => {
                const isPast = c.end_date < new Date().toISOString().slice(0, 10);
                const isPastUnanswered = isPast && c.status === "pending";
                return (
                  <li
                    key={c.constraints_id}
                    className={`${styles.historyItem} ${
                      isPast ? styles.historyItemPast : ""
                    }`}
                  >
                    <div className={styles.historyDates}>
                      {c.start_date === c.end_date
                        ? c.start_date
                        : `${c.start_date} → ${c.end_date}`}
                      <span
                        className={`${styles.statusBadge} ${
                          styles[
                            `statusBadge${c.status[0].toUpperCase()}${c.status.slice(1)}`
                          ]
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className={styles.historyNotes}>{c.notes}</div>
                    {isPastUnanswered && (
                      <div className={styles.historyHint}>
                        No decision was made before these dates — you were
                        expected to teach as usual.
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {conflictLessons && (
        <LessonConflictModal
          firstName={user?.first_name || "there"}
          lessons={conflictLessons}
          startDate={startDate}
          endDate={endDate}
          submitting={submitting}
          onGoBack={() => setConflictLessons(null)}
          onSubmitAnyway={submitRequest}
        />
      )}
    </div>
  );
}

export default InstructorConstraints;
