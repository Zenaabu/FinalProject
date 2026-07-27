const express = require("express");
const router = express.Router();

const adminQ = require("../queries/adminQueries");

const { requireLogin, requireAdmin } = require("../validations/authValidation");
const {
  validateRoleUpdate,
  validateBlockedStatus,
  validateVideoUpload,
} = require("../validations/adminValidations");
const { checkUserExists } = require("../validations/usersValidations");

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

      res.json({
        success: true,
        constraints: rows,
      });
    });
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

module.exports = router;
