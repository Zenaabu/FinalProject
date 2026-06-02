const express = require("express");
const router = express.Router();

const courseQ = require("../queries/courseQueries");

const {
  requireLogin,
  requireInstructor,
} = require("../validations/authValidation");

// GET instructor courses
// url: /api/instructor/courses
router.get("/courses", requireLogin, requireInstructor, (req, res) => {
  const instructorId = req.session.user.user_id;

  courseQ.getCoursesByInstructorId(instructorId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      courses: rows,
    });
  });
});

module.exports = router;
