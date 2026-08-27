// queries/reportsQueries.js
const db = require("../DB/dbSingleton");

// Same convention as financialsQueries.js: every query takes a
// ['YYYY-MM-DD', 'YYYY-MM-DD'] range and matches rows as
// `col >= startDate AND col < nextDay(endDate)` rather than `BETWEEN`.
function nextDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// a function that returns the headline KPIs for the admin Reports page,
// scoped to [startDate, endDate]: total registrations, distinct
// (active) customers, the attendance rate among marked lessons, and how
// many registrations in the period were a *repeat* booking with an
// instructor the same user had already booked before (see
// getInstructorLoyalty for how "repeat" is defined).
function getReportsSummary(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT
        (SELECT COUNT(*)
           FROM register r
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS total_registrations,
        (SELECT COUNT(DISTINCT r.user_id)
           FROM register r
          WHERE r.payment_date >= ? AND r.payment_date < ?) AS active_customers,
        (SELECT COUNT(*)
           FROM attend a
           JOIN lessons l ON l.lesson_id = a.lesson_id
          WHERE l.lesson_date >= ? AND l.lesson_date < ?
            AND a.attended = 'present') AS present_count,
        (SELECT COUNT(*)
           FROM attend a
           JOIN lessons l ON l.lesson_id = a.lesson_id
          WHERE l.lesson_date >= ? AND l.lesson_date < ?) AS marked_count,
        (SELECT COUNT(*)
           FROM (
             SELECT r.payment_date,
                    ROW_NUMBER() OVER (
                      PARTITION BY r.user_id, c.user_id
                      ORDER BY r.payment_date, r.receipt_number
                    ) AS rn
             FROM register r
             JOIN courses c ON c.course_id = r.course_id
           ) ranked
          WHERE ranked.rn >= 2
            AND ranked.payment_date >= ? AND ranked.payment_date < ?) AS repeat_instructor_bookings`,
    [startDate, end, startDate, end, startDate, end, startDate, end, startDate, end],
    cb,
  );
}

// a function that returns, for [startDate, endDate], how many distinct
// customers who registered for a course in the period are male vs
// female — the crowd, not the whole historical user table, so the
// number moves with the date range like every other report.
function getGenderDistribution(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT u.gender, COUNT(DISTINCT u.user_id) AS user_count
     FROM register r
     JOIN users u ON u.user_id = r.user_id
     WHERE r.payment_date >= ? AND r.payment_date < ?
     GROUP BY u.gender`,
    [startDate, end],
    cb,
  );
}

// a function that returns registrations in [startDate, endDate] grouped
// by calendar month (1-12), summed across every year the range spans —
// this is what surfaces the seasonal pattern ("we register more in
// summer") rather than just a month-by-month trend of one particular year.
function getRegistrationsByMonth(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT MONTH(r.payment_date) AS month_num, COUNT(*) AS registrations
     FROM register r
     WHERE r.payment_date >= ? AND r.payment_date < ?
     GROUP BY month_num`,
    [startDate, end],
    cb,
  );
}

// a function that returns present vs. absent counts for every attendance
// record marked on a lesson whose lesson_date falls in [startDate,
// endDate] — global attendance health for the period, not per-course.
function getAttendanceSummary(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT a.attended, COUNT(*) AS cnt
     FROM attend a
     JOIN lessons l ON l.lesson_id = a.lesson_id
     WHERE l.lesson_date >= ? AND l.lesson_date < ?
     GROUP BY a.attended`,
    [startDate, end],
    cb,
  );
}

// a function that returns registrations in [startDate, endDate] grouped
// by course level — always all three levels (see getRevenueByLevel in
// financialsQueries.js for the same LEFT-JOIN-with-the-date-filter-in-ON
// pattern), since level is a fixed tier, not a ranked list.
function getRegistrationsByLevel(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT c.level, COUNT(r.user_id) AS registrations
     FROM courses c
     LEFT JOIN register r
       ON r.course_id = c.course_id
      AND r.payment_date >= ? AND r.payment_date < ?
     GROUP BY c.level`,
    [startDate, end],
    cb,
  );
}

// a function that ranks *every* instructor by "loyalty": how many times,
// in [startDate, endDate], a user registered for a course taught by an
// instructor they had *already* registered with before. A user's very
// first booking with an instructor never counts — only their 2nd, 3rd,
// etc. — via ROW_NUMBER() partitioned per (student, instructor) pair
// ordered chronologically across the student's *entire* history (not
// just the selected range, so a repeat is recognized even if the first
// booking happened earlier), then filtered down to rn >= 2 rows whose
// payment_date falls in the requested period. Every instructor is
// included even at 0 (LEFT JOIN from users, not an inner join off the
// ranked subquery), same "always show the full set" convention as
// getRegistrationsByLevel — otherwise an instructor with no repeats yet
// just silently disappears instead of reading as "zero so far".
function getInstructorLoyalty(startDate, endDate, cb) {
  const conn = db.getConnection();
  const end = nextDay(endDate);

  conn.query(
    `SELECT u.user_id AS instructor_id,
            CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
            COALESCE(repeats.repeat_count, 0) AS repeat_count
     FROM users u
     LEFT JOIN (
       SELECT ranked.instructor_id, COUNT(*) AS repeat_count
       FROM (
         SELECT r.user_id,
                c.user_id AS instructor_id,
                r.payment_date,
                ROW_NUMBER() OVER (
                  PARTITION BY r.user_id, c.user_id
                  ORDER BY r.payment_date, r.receipt_number
                ) AS rn
         FROM register r
         JOIN courses c ON c.course_id = r.course_id
       ) ranked
       WHERE ranked.rn >= 2
         AND ranked.payment_date >= ? AND ranked.payment_date < ?
       GROUP BY ranked.instructor_id
     ) repeats ON repeats.instructor_id = u.user_id
     WHERE u.role = 'instructor'
     ORDER BY repeat_count DESC, instructor_name ASC`,
    [startDate, end],
    cb,
  );
}

module.exports = {
  getReportsSummary,
  getGenderDistribution,
  getRegistrationsByMonth,
  getAttendanceSummary,
  getRegistrationsByLevel,
  getInstructorLoyalty,
};
