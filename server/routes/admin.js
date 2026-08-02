const express = require("express");
const router = express.Router();

const adminQ = require("../queries/adminQueries");

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

// GET the most recent course registrations for the admin dashboard home page
// url: /api/admin/recent-registrations
router.get(
  "/recent-registrations",
  requireLogin,
  requireAdmin,
  (req, res) => {
    adminQ.getRecentRegistrations(6, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, registrations: rows });
    });
  },
);

module.exports = router;
