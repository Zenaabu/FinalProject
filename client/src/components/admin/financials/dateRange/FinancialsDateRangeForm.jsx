// ─── FinancialsDateRangeForm.jsx ──────────────────────────────────────────────
// Date-range search for the Financials page. Same visual pattern as the
// course date-range search in CourseManagerDashboard.jsx, but both dates are
// required here (every financials endpoint needs a concrete window) and it
// includes a one-click "This Month" reset back to the default range.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import styles from "./FinancialsDateRangeForm.module.css";

function toDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: toDateOnly(start), endDate: toDateOnly(now) };
}

const TODAY = toDateOnly(new Date());

function FinancialsDateRangeForm({ startDate, endDate, onApply }) {
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);

  const rangeError =
    draftStart && draftEnd && draftEnd < draftStart
      ? "End date must be after start date"
      : null;

  const thisMonth = currentMonthRange();
  const isCurrentMonth =
    startDate === thisMonth.startDate && endDate === thisMonth.endDate;

  function handleSubmit(e) {
    e.preventDefault();
    if (rangeError || !draftStart || !draftEnd) return;
    onApply(draftStart, draftEnd);
  }

  function handleThisMonth() {
    setDraftStart(thisMonth.startDate);
    setDraftEnd(thisMonth.endDate);
    onApply(thisMonth.startDate, thisMonth.endDate);
  }

  return (
    <div className={styles.wrap}>
      <form
        className={styles.dateSearch}
        onSubmit={handleSubmit}
        aria-label="Search financials by date range"
      >
        <label className={styles.dateField}>
          <span className={styles.dateLabel}>From</span>
          <input
            type="date"
            className={styles.dateInput}
            value={draftStart}
            max={draftEnd || TODAY}
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
            max={TODAY}
            onChange={(e) => setDraftEnd(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className={styles.searchBtn}
          disabled={Boolean(rangeError) || !draftStart || !draftEnd}
        >
          <Search size={15} />
          Search
        </button>

        {!isCurrentMonth && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleThisMonth}
          >
            <RotateCcw size={13} />
            This Month
          </button>
        )}
      </form>

      {rangeError && <p className={styles.dateError}>{rangeError}</p>}
    </div>
  );
}

export default FinancialsDateRangeForm;
