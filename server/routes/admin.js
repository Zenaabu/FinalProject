const express = require("express");
const router = express.Router();

const adminQ = require("../queries/adminQueries");
const courseQ = require("../queries/courseQueries");
const financialsQ = require("../queries/financialsQueries");

const { requireLogin, requireAdmin } = require("../validations/authValidation");
const {
  validateRoleUpdate,
  validateBlockedStatus,
  validateVideoUpload,
  validateConstraintExists,
  validateConstraintStatusValue,
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
// dashboard home page's "Courses" table
// url: /api/admin/recent-courses
router.get("/recent-courses", requireLogin, requireAdmin, (req, res) => {
  adminQ.getRecentCourses(6, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const today = new Date().toISOString().slice(0, 10);
    const courses = rows.map((c) => ({
      course_id: c.course_id,
      name: c.description,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.start_date > today ? "Upcoming" : "Active",
    }));

    res.json({ success: true, courses });
  });
});

// GET the headline KPI numbers for the admin Financials page: all-time
// revenue, this month's revenue with % change vs last month, this month's
// VAT collected, and the all-time average order value
// url: /api/admin/financials/summary
router.get("/financials/summary", requireLogin, requireAdmin, (req, res) => {
  financialsQ.getFinancialsSummary((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const row = rows[0];
    const totalRevenue = Number(row.total_revenue);
    const monthRevenue = Number(row.month_revenue);
    const lastMonthRevenue = Number(row.last_month_revenue);
    const totalTransactions = Number(row.total_transactions);

    const monthChangePct =
      lastMonthRevenue > 0
        ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : null;

    res.json({
      success: true,
      summary: {
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        month_revenue: monthRevenue,
        month_change_pct: monthChangePct,
        vat_collected_month: Number(row.vat_collected_month),
        avg_order_value:
          totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      },
    });
  });
});

// GET monthly revenue (excl. VAT) for the trailing N months (default 6),
// oldest first, with zero-revenue months filled in so the trend line never
// silently skips a month
// url: /api/admin/financials/revenue-trend?months=6
router.get(
  "/financials/revenue-trend",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    financialsQ.getRevenueTrend(months, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const revenueByMonth = {};
      for (const row of rows) revenueByMonth[row.month] = Number(row.revenue);

      // walk back `months` months from the current month so every month in
      // the window appears, even ones with no rows in `rows`
      const trend = [];
      const cursor = new Date();
      cursor.setDate(1);
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(cursor);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        trend.push({
          month: key,
          month_label: d.toLocaleDateString("en-US", { month: "short" }),
          revenue: revenueByMonth[key] || 0,
        });
      }

      res.json({ success: true, trend });
    });
  },
);

// GET how PayPal checkout attempts resolved over the trailing N days
// (default 30): started -> reached a payment decision (approved or failed)
// -> approved, plus the abandoned/still-in-progress counts behind the
// drop-off between those stages
// url: /api/admin/financials/payment-funnel?days=30
router.get(
  "/financials/payment-funnel",
  requireLogin,
  requireAdmin,
  (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);

    financialsQ.getPaymentFunnel(days, (err, rows) => {
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
        period_days: days,
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

// GET revenue (excl. VAT) grouped by course level, always in beginner ->
// intermediate -> advanced order since level is a tier, not a ranking
// url: /api/admin/financials/revenue-by-level
router.get(
  "/financials/revenue-by-level",
  requireLogin,
  requireAdmin,
  (req, res) => {
    financialsQ.getRevenueByLevel((err, rows) => {
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

      res.json({ success: true, levels });
    });
  },
);

module.exports = router;
