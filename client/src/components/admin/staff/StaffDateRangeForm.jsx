// ─── StaffDateRangeForm.jsx ───────────────────────────────────────────────
// Date-range search for the Staff Scheduling page. Same pattern as
// FinancialsDateRangeForm: defaults to the current month, both dates are
// required, and there's a one-click "This Month" reset back to the default.
// The admin shouldn't have to look through every request ever submitted by
// default — just this month's, with the option to search back further.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import styles from "./StaffDateRangeForm.module.css";

function toDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

// The FULL calendar month, 1st through last day — not "1st through today".
// Staff requests are forward-looking (an instructor asking off for a future
// date), unlike financial data which only ever looks at the past, so
// capping this at today would hide requests later in the month that
// genuinely belong in "this month".
function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate: toDateOnly(start), endDate: toDateOnly(end) };
}

function StaffDateRangeForm({ startDate, endDate, onApply }) {
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
        aria-label="Search staff requests by date range"
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

export default StaffDateRangeForm;
export { currentMonthRange };
