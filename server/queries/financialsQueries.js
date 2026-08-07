// queries/financialsQueries.js
const db = require("../DB/dbSingleton");

// a function that returns the headline money KPIs for the admin Financials
// page: all-time revenue, this month's revenue (plus last month's, so the
// route can derive a % change), this month's VAT collected, and the
// all-time average order value across every completed registration.
// Revenue is always course price excl. VAT (c.price / (1 + vat_percent/100)),
// matching the convention already used by getDashboardStats.
function getFinancialsSummary(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id) AS total_revenue,
        (SELECT COUNT(*) FROM register) AS total_transactions,
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE MONTH(r.payment_date) = MONTH(CURDATE())
            AND YEAR(r.payment_date) = YEAR(CURDATE())) AS month_revenue,
        (SELECT COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE MONTH(r.payment_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
            AND YEAR(r.payment_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
         ) AS last_month_revenue,
        (SELECT COALESCE(SUM(c.price - c.price / (1 + c.vat_percent / 100)), 0)
           FROM register r
           JOIN courses c ON r.course_id = c.course_id
          WHERE MONTH(r.payment_date) = MONTH(CURDATE())
            AND YEAR(r.payment_date) = YEAR(CURDATE())) AS vat_collected_month`,
    cb,
  );
}

// a function that gets a number of months and returns monthly revenue
// (excl. VAT) for that trailing window, oldest first — grouped in SQL,
// gap-filled for months with zero registrations in the route handler
// since a plain GROUP BY only returns months that actually had a payment
function getRevenueTrend(months, cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        DATE_FORMAT(r.payment_date, '%Y-%m') AS month,
        SUM(c.price / (1 + c.vat_percent / 100)) AS revenue
     FROM register r
     JOIN courses c ON r.course_id = c.course_id
     WHERE r.payment_date >= DATE_SUB(
             DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL ? MONTH)
     GROUP BY month
     ORDER BY month`,
    [months - 1],
    cb,
  );
}

// a function that gets a number of days and returns how PayPal checkout
// attempts in that window resolved: approved, explicitly failed, or
// abandoned (either status = 'expired', or still 'pending' but its
// expires_at has already passed — a reservation whose seat-hold ran out
// without ever getting a status update, per the reservation lifecycle
// described in courseQueries.expireOldReservations) vs still genuinely in
// progress (pending and not yet expired)
function getPaymentFunnel(days, cb) {
  const conn = db.getConnection();

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
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days],
    cb,
  );
}

// a function that returns revenue (excl. VAT) grouped by course level —
// always all three levels, even one with zero registrations, since the
// chart shows level as a fixed ordinal progression rather than a ranked list
function getRevenueByLevel(cb) {
  const conn = db.getConnection();

  conn.query(
    `SELECT
        c.level,
        COALESCE(SUM(c.price / (1 + c.vat_percent / 100)), 0) AS revenue
     FROM courses c
     LEFT JOIN register r ON r.course_id = c.course_id
     GROUP BY c.level`,
    cb,
  );
}

module.exports = {
  getFinancialsSummary,
  getRevenueTrend,
  getPaymentFunnel,
  getRevenueByLevel,
};
