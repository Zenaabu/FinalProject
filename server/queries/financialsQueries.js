// queries/financialsQueries.js
const db = require("../DB/dbSingleton");

// Every query below takes a ['YYYY-MM-DD', 'YYYY-MM-DD'] range and matches
// rows as `col >= startDate AND col < nextDay(endDate)` rather than
// `BETWEEN startDate AND endDate` — payment_date/created_at are DATETIME
// columns, so a bare BETWEEN would silently exclude same-day rows after
// midnight on the end date.
function nextDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// a function that returns the headline money KPIs for the admin Financials
// page, scoped to [startDate, endDate]: period revenue, period transactions,
// period VAT collected, plus the previous period's revenue (same length,
// immediately before startDate) so the route can derive a % change.
// Revenue is always course price excl. VAT (c.price / (1 + vat_percent/100)),
// matching the convention already used by getDashboardStats.
function getFinancialsSummary(startDate, endDate, prevStartDate, prevEndDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);
  const prevEnd = nextDay(prevEndDate);

  conn.query(
    `SELECT
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS period_revenue,
        (SELECT COUNT(*)
           FROM register r
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS period_transactions,
        (SELECT COALESCE(SUM(c.price - c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS period_vat,
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS prev_period_revenue`,
    [startDate, end, startDate, end, startDate, end, prevStartDate, prevEnd],
    cb,
  );
}

// a function that returns daily revenue (excl. VAT) for [startDate, endDate],
// oldest first — grouped in SQL, gap-filled for days with zero registrations
// in the route handler since a plain GROUP BY only returns days that
// actually had a payment
function getRevenueTrend(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT
        DATE(r.payment_date) AS day,
        SUM(c.price / (1 + c.vat_percent / 100)) AS revenue
     FROM register r
     JOIN courses c ON r.course_id = c.course_id
     WHERE r.payment_date >= ? AND r.payment_date < ?
     GROUP BY day
     ORDER BY day`,
    [startDate, end],
    cb,
  );
}

// a function that returns how PayPal checkout attempts in [startDate,
// endDate] resolved: approved, explicitly failed, or abandoned (either
// status = 'expired', or still 'pending' but its expires_at has already
// passed — a reservation whose seat-hold ran out without ever getting a
// status update, per the reservation lifecycle described in
// courseQueries.expireOldReservations) vs still genuinely in progress
// (pending and not yet expired)
function getPaymentFunnel(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT
        COUNT(*) AS started,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
        SUM(CASE
              WHEN status = 'expired'
                OR (status = 'pending' AND expires_at <= NOW())
              THEN 1 ELSE 0
            END) AS abandoned,
        SUM(CASE
              WHEN status = 'pending' AND expires_at > NOW()
              THEN 1 ELSE 0
            END) AS in_progress
     FROM course_reservations
     WHERE created_at >= ? AND created_at < ?`,
    [startDate, end],
    cb,
  );
}

// a function that returns revenue (excl. VAT) grouped by course level for
// [startDate, endDate] — always all three levels, even one with zero
// registrations in range, since the chart shows level as a fixed ordinal
// progression rather than a ranked list. The date filter lives in the JOIN
// condition (not WHERE) so a level with no registrations in range still
// shows up with revenue 0 instead of being dropped by the LEFT JOIN.
function getRevenueByLevel(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT
        c.level,
        COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0) AS revenue
     FROM courses c
     LEFT JOIN register r
       ON r.course_id = c.course_id
      AND r.payment_date >= ? AND r.payment_date < ?
     GROUP BY c.level`,
    [startDate, end],
    cb,
  );
}

module.exports = {
  getFinancialsSummary,
  getRevenueTrend,
  getPaymentFunnel,
  getRevenueByLevel,
};
