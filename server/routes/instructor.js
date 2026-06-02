const express = require("express");
const router = express.Router();

const courseQ = require("../queries/courseQueries");
const instructorQ = require("../queries/instructorQueries");

const {
  requireLogin,
  requireInstructor,
} = require("../validations/authValidation");

const {
  validateInstructorOwnsCourse,
  validateAttendanceAllowed,
  validateInstructorOwnsLesson,
  validateAttendanceBody,
  validateUserRegisteredToLessonCourse,
} = require("../validations/instructorValidations");

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

// GET registrations for course that belongs to logged-in instructor
// url: /api/instructor/courses/:course_id/registrations
router.get(
  "/courses/:course_id/registrations",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsCourse,
  (req, res) => {
    const { course_id } = req.params;
    const instructorId = req.session.user.user_id;

    instructorQ.getCourseRegistrationsForInstructor(
      course_id,
      instructorId,
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        res.json({
          success: true,
          registrations: rows,
        });
      },
    );
  },
);

// POST save attendance
// url: /api/instructor/lessons/:lesson_id/attendance
router.post(
  "/lessons/:lesson_id/attendance",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsLesson,
  validateAttendanceBody,
  validateUserRegisteredToLessonCourse,
  validateAttendanceAllowed,
  (req, res) => {
    const lessonId = req.params.lesson_id;
    const { user_id, attended } = req.body;

    instructorQ.saveAttendance(lessonId, user_id, attended, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Attendance saved successfully",
      });
    });
  },
);

module.exports = router;
