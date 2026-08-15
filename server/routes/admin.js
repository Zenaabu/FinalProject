const express = require("express");
const router = express.Router();

const adminQ = require("../queries/adminQueries");
const courseQ = require("../queries/courseQueries");
const financialsQ = require("../queries/financialsQueries");
const settingsQ = require("../queries/settingsQueries");

const { requireLogin, requireAdmin } = require("../validations/authValidation");
const {
  validateRoleUpdate,
  validateBlockedStatus,
  validateVideoUpload,
  validateConstraintExists,
  validateConstraintStatusValue,
  validateVatUpdate,
} = require("../validations/adminValidations");
const { checkUserExists } = require("../validations/usersValidations");
const { formatDateOnly, formatTimeOnly } = require("../validations/utils");

const upload = require("../middlewares/uploadVideo");

// GET all users
// url: /api/admin/users
router.get("/users", requireLogin, requireAdmin, (req, res) => {
  adminQ.getAllUsers(req.session.user.user_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({
      success: true,
      users: rows,
    });
  });
});

// PUT user role
// url: /api/admin/users/:user_id/role
router.put(
  "/users/:user_id/role",
  requireLogin,
  requireAdmin,
  validateRoleUpdate,
  checkUserExists,
  (req, res) => {
    const { user_id } = req.params;
    const { role } = req.body;

    adminQ.updateUserRole(user_id, role, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Role updated successfully",
      });
    });
  },
);

// PUT user blocked status
// url: /api/admin/users/:user_id/block
router.put(
  "/users/:user_id/block",
  requireLogin,
  requireAdmin,
  validateBlockedStatus,
  checkUserExists,
  (req, res) => {
    const { user_id } = req.params;
    const { is_blocked } = req.body;

    // convert true/false to 1/0
    const blockedValue = is_blocked === true || is_blocked === 1 ? 1 : 0;

    adminQ.updateUserBlockedStatus(user_id, blockedValue, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Blocked status updated successfully",
      });
    });
  },
);

// GET the courses a specific user is currently enrolled in (excludes courses
// that have already finished) — used by the "View Courses" row action on the
// User Database table
// url: /api/admin/users/:user_id/courses
router.get(
  "/users/:user_id/courses",
  requireLogin,
  requireAdmin,
  checkUserExists,
  (req, res) => {
    const { user_id } = req.params;

    adminQ.getActiveCoursesForUser(user_id, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, courses: rows });
    });
  },
);

// GET the courses a specific instructor is currently teaching (running or
// upcoming — excludes courses that have already finished) — used by the
// "View Courses" row action on the Staff Scheduling table
// url: /api/admin/instructors/:user_id/courses
router.get(
  "/instructors/:user_id/courses",
  requireLogin,
  requireAdmin,
  checkUserExists,
  (req, res) => {
    const { user_id } = req.params;

    courseQ.getActiveCoursesByInstructorId(user_id, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, courses: rows });
    });
  },
);

// GET all instructor constraints
// url: /api/admin/instructor-constraints
router.get(
  "/instructor-constraints",
  requireLogin,
  requireAdmin,
  (req, res) => {
    adminQ.getAllInstructorConstraints((err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      const constraints = rows.map((row) => ({
        constraints_id: row.constraints_id,
        user_id: row.user_id,
        instructor_name: `${row.first_name} ${row.last_name}`,
        start_date: formatDateOnly(row.start_time),
        end_date: formatDateOnly(row.end_time),
        notes: row.notes,
        status: row.status,
        // only meaningful once approved — a pending/rejected constraint has
        // no lessons that need reassigning yet
        unresolved_lesson_count: Number(row.unresolved_lesson_count),
      }));

      res.json({
        success: true,
        constraints,
      });
    });
  },
);

// PUT approve or reject an instructor constraint
// body: { status: 'approved' | 'rejected' }
// url: /api/admin/instructor-constraints/:constraints_id/status
router.put(
  "/instructor-constraints/:constraints_id/status",
  requireLogin,
  requireAdmin,
  validateConstraintExists,
  validateConstraintStatusValue,
  (req, res) => {
    const { constraints_id } = req.params;
    const { status } = req.body;

    adminQ.updateConstraintStatus(constraints_id, status, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: `Constraint ${status}`,
        constraints_id: Number(constraints_id),
        status,
      });
    });
  },
);

// GET the lessons an approved (or any) constraint actually falls on, so the
// admin can assign a substitute instructor or reschedule each one
// url: /api/admin/instructor-constraints/:constraints_id/affected-lessons
router.get(
  "/instructor-constraints/:constraints_id/affected-lessons",
  requireLogin,
  requireAdmin,
  validateConstraintExists,
  (req, res) => {
    const { constraints_id } = req.params;
    const { user_id, start_time, end_time } = req.constraint;

    adminQ.getAffectedLessonsForConstraint(
      user_id,
      formatDateOnly(start_time),
      formatDateOnly(end_time),
      constraints_id,
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        adminQ.getLessonHistoryForConstraint(constraints_id, (err2, historyRows) => {
          if (err2) {
            return res.status(500).json({
              success: false,
              message: err2.message,
            });
          }

          const historyByLesson = {};
          for (const h of historyRows) {
            if (!historyByLesson[h.lesson_id]) historyByLesson[h.lesson_id] = [];
            historyByLesson[h.lesson_id].push({
              change_type: h.change_type,
              details: h.details,
              created_at: h.created_at,
            });
          }

          const lessons = rows.map((row) => ({
            course_id: row.course_id,
            course_description: row.course_description,
            lesson_id: row.lesson_id,
            lesson_number: row.lesson_number,
            lesson_date: formatDateOnly(row.lesson_date),
            start_time: formatTimeOnly(row.start_time),
            end_time: formatTimeOnly(row.end_time),
            substitute_instructor_id: row.substitute_instructor_id,
            substitute_name: row.substitute_instructor_id
              ? `${row.substitute_first_name} ${row.substitute_last_name}`
              : null,
            history: historyByLesson[row.lesson_id] || [],
          }));

          res.json({
            success: true,
            lessons,
          });
        });
      },
    );
  },
);

// POST upload video
// url: /api/admin/upload-video
router.post(
  "/upload-video",
  requireAdmin,
  upload.single("video"),
  validateVideoUpload,
  (req, res) => {
    const { title, description } = req.body;

    // path that will be saved in DB
    const url = `/uploads/videos/${req.file.filename}`;

    adminQ.addVideo(url, title, description, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Video uploaded successfully",
        url: url,
      });
    });
  },
);

// GET all instructors (users with role = 'instructor')
// url: /api/admin/instructors
router.get("/instructors", requireLogin, requireAdmin, (req, res) => {
  adminQ.getInstructors((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, instructors: rows });
  });
});

// GET instructors free to substitute a specific lesson slot — excludes the
// lesson's own instructor and anyone already teaching/substituting another
// lesson that overlaps this exact date/time, so the admin only ever sees
// choices that will actually succeed instead of picking one and hitting the
// "already teaches another lesson" conflict error
// url: /api/admin/instructors/available-for-lesson?date=2026-08-15&start_time=14:00&end_time=16:00&exclude_instructor_id=123456789
router.get(
  "/instructors/available-for-lesson",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const { date, start_time, end_time, exclude_instructor_id } = req.query;

    if (!date || !start_time || !end_time || !exclude_instructor_id) {
      return res.status(400).json({
        success: false,
        message:
          "date, start_time, end_time and exclude_instructor_id are required",
      });
    }

    adminQ.getAvailableInstructorsForSlot(
      exclude_instructor_id,
      date,
      start_time,
      end_time,
      (err, rows) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, instructors: rows });
      },
    );
  },
);

// GET the KPI numbers for the admin dashboard home page
// url: /api/admin/dashboard-stats
router.get("/dashboard-stats", requireLogin, requireAdmin, (req, res) => {
  adminQ.getDashboardStats((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, stats: rows[0] });
  });
});

// GET a bounded list of courses (name + start/end date) for the admin
// dashboard home page's "Courses" table, each flagged with under_capacity
// using the exact same rule as the "Courses Starting Soon" KPI
// (getDashboardStats' at_risk_courses) — starting within 7 days and under
// 50% enrolled — so the courses flagged here always add up to that number.
// Only courses that haven't started yet are ever flagged — once a course is
// already running, its capacity isn't something the admin can still act on.
// url: /api/admin/recent-courses
router.get("/recent-courses", requireLogin, requireAdmin, (req, res) => {
  adminQ.getRecentCourses(6, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const today = new Date().toISOString().slice(0, 10);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = weekFromNow.toISOString().slice(0, 10);

    const courses = rows.map((c) => {
      const capacity = Number(c.capacity);
      const taken = Number(c.taken);
      const startingSoon =
        c.start_date > today && c.start_date <= weekFromNowStr;

      return {
        course_id: c.course_id,
        name: c.description,
        start_date: c.start_date,
        end_date: c.end_date,
        status: c.start_date > today ? "Upcoming" : "Active",
        capacity,
        enrolled: taken,
        under_capacity: startingSoon && taken < capacity * 0.5,
      };
    });

    res.json({ success: true, courses });
  });
});

// ── Financials date-range helpers ─────────────────────────────────────────
// All four /financials/* endpoints below are scoped to a [startDate,
// endDate] window the admin controls from the client's date-range search
// (default: the current month). These are read-only GET filters, so — same
// spirit as the months/days clamping the old endpoints used — malformed or
// missing dates just fall back to a sane default instead of a 400.
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value) {
  return DATE_ONLY_RE.test(value) && !isNaN(new Date(value));
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: toDateOnly(start), endDate: toDateOnly(now) };
}

// Resolves the requested range from the query string, defaulting to (and
// falling back to, on anything invalid) the current month.
function resolveDateRange(req) {
  const { startDate, endDate } = req.query;

  if (
    isValidDateOnly(startDate) &&
    isValidDateOnly(endDate) &&
    startDate <= endDate
  ) {
    return { startDate, endDate };
  }

  return currentMonthRange();
}

// The immediately-preceding period of equal length, used for the "vs
// previous period" comparison — generalizes "vs last month" to any range.
function previousPeriod(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const lengthDays = Math.round((end - start) / 86400000) + 1;

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (lengthDays - 1));

  return {
    prevStartDate: toDateOnly(prevStart),
    prevEndDate: toDateOnly(prevEnd),
  };
}

// GET the headline money KPIs for the admin Financials page, scoped to
// [startDate, endDate]: period revenue, period transactions, period VAT
// collected, average order value, and % change vs the previous period of
// equal length
// url: /api/admin/financials/summary?startDate=2026-08-01&endDate=2026-08-11
router.get("/financials/summary", requireLogin, requireAdmin, (req, res) => {
  const { startDate, endDate } = resolveDateRange(req);
  const { prevStartDate, prevEndDate } = previousPeriod(startDate, endDate);

  financialsQ.getFinancialsSummary(
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const row = rows[0];
      const periodRevenue = Number(row.period_revenue);
      const periodTransactions = Number(row.period_transactions);
      const prevPeriodRevenue = Number(row.prev_period_revenue);

      const changePct =
        prevPeriodRevenue > 0
          ? ((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100
          : null;

      res.json({
        success: true,
        start_date: startDate,
        end_date: endDate,
        summary: {
          period_revenue: periodRevenue,
          period_transactions: periodTransactions,
          period_vat: Number(row.period_vat),
          avg_order_value:
            periodTransactions > 0 ? periodRevenue / periodTransactions : 0,
          change_pct: changePct,
        },
      });
    },
  );
});

// GET daily revenue (excl. VAT) for [startDate, endDate], with zero-revenue
// days filled in so the trend line never silently skips a day
// url: /api/admin/financials/revenue-trend?startDate=2026-08-01&endDate=2026-08-11
router.get(
  "/financials/revenue-trend",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const { startDate, endDate } = resolveDateRange(req);

    financialsQ.getRevenueTrend(startDate, endDate, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const revenueByDay = {};
      for (const row of rows) {
        revenueByDay[row.day] = Number(row.revenue);
      }

      // walk every day in [startDate, endDate] so the chart never silently
      // skips a day that had no registrations
      const trend = [];
      const cursor = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      while (cursor <= end) {
        const key = toDateOnly(cursor);
        trend.push({
          day: key,
          day_label: cursor.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: revenueByDay[key] || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      res.json({ success: true, start_date: startDate, end_date: endDate, trend });
    });
  },
);

// GET how PayPal checkout attempts resolved in [startDate, endDate]: started
// -> reached a payment decision (approved or failed) -> approved, plus the
// abandoned/still-in-progress counts behind the drop-off between those stages
// url: /api/admin/financials/payment-funnel?startDate=2026-08-01&endDate=2026-08-11
router.get(
  "/financials/payment-funnel",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const { startDate, endDate } = resolveDateRange(req);

    financialsQ.getPaymentFunnel(startDate, endDate, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const row = rows[0];
      const started = Number(row.started);
      const approved = Number(row.approved);
      const failed = Number(row.failed);
      const abandoned = Number(row.abandoned);
      const inProgress = Number(row.in_progress);
      const reachedDecision = approved + failed;

      res.json({
        success: true,
        start_date: startDate,
        end_date: endDate,
        conversion_rate: started > 0 ? (approved / started) * 100 : null,
        funnel: [
          { stage: "started", label: "Checkout Started", count: started },
          {
            stage: "decision",
            label: "Reached Payment",
            count: reachedDecision,
          },
          { stage: "approved", label: "Approved", count: approved },
        ],
        breakdown: { failed, abandoned, in_progress: inProgress },
      });
    });
  },
);

// GET revenue (excl. VAT) grouped by course level for [startDate, endDate],
// always in beginner -> intermediate -> advanced order since level is a
// tier, not a ranking
// url: /api/admin/financials/revenue-by-level?startDate=2026-08-01&endDate=2026-08-11
router.get(
  "/financials/revenue-by-level",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const { startDate, endDate } = resolveDateRange(req);

    financialsQ.getRevenueByLevel(startDate, endDate, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];
      const revenueByLevel = {};
      for (const row of rows) revenueByLevel[row.level] = Number(row.revenue);

      const levels = LEVEL_ORDER.map((level) => ({
        level,
        revenue: revenueByLevel[level] || 0,
      }));

      res.json({ success: true, start_date: startDate, end_date: endDate, levels });
    });
  },
);

// GET the current school-wide VAT rate
// url: /api/admin/financials/vat-rate
router.get("/financials/vat-rate", requireLogin, requireAdmin, (req, res) => {
  settingsQ.getVatPercent((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({ success: true, vat_percent: Number(rows[0].vat_percent) });
  });
});

// PUT the school-wide VAT rate — applies immediately to every course, since
// VAT is one rate the whole school charges, not something set per course
// url: /api/admin/financials/vat-rate
router.put(
  "/financials/vat-rate",
  requireLogin,
  requireAdmin,
  validateVatUpdate,
  (req, res) => {
    settingsQ.updateVatPercent(req.vat_percent, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, vat_percent: req.vat_percent });
    });
  },
);

module.exports = router;
