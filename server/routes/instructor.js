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
  validateUsersRegisteredToLessonCourse,
  validateLessonsInRangeQuery,
  validateAddConstraint,
  validateDuplicateConstraint,
  validateOverlappingConstraint,
} = require("../validations/instructorValidations");

const {
  canTakeAttendance,
  formatDateOnly,
  formatTimeOnly,
} = require("../validations/utils");

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

// GET the lessons the logged-in instructor is covering as a substitute for
// another instructor (assigned by an admin when resolving a time-off request)
// url: /api/instructor/substitute-lessons
router.get(
  "/substitute-lessons",
  requireLogin,
  requireInstructor,
  (req, res) => {
    const instructorId = req.session.user.user_id;

    instructorQ.getSubstituteLessonsForInstructor(
      instructorId,
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        const lessons = rows.map((row) => ({
          lesson_id: row.lesson_id,
          lesson_number: row.lesson_number,
          lesson_date: formatDateOnly(row.lesson_date),
          start_time: formatTimeOnly(row.start_time),
          end_time: formatTimeOnly(row.end_time),
          course_id: row.course_id,
          course_description: row.course_description,
          original_instructor_name: `${row.original_instructor_first_name} ${row.original_instructor_last_name}`,
          can_take_attendance: canTakeAttendance(
            row.lesson_date,
            row.start_time,
            row.end_date,
          ),
          // true until attendance is actually recorded for this lesson —
          // the sidebar badge / dashboard banner alert stays up based on
          // this, not on the date, so it only clears once the substitute
          // lesson has genuinely been covered
          needs_attention: !row.has_attendance,
        }));

        res.json({
          success: true,
          lessons,
        });
      },
    );
  },
);

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

// GET the roster of a lesson together with the attendance already recorded
// url: /api/instructor/lessons/:lesson_id/attendance
router.get(
  "/lessons/:lesson_id/attendance",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsLesson,
  (req, res) => {
    const lessonId = req.params.lesson_id;

    instructorQ.getLessonAttendance(lessonId, (err, students) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      instructorQ.getLatestLessonChange(lessonId, (err2, changeRows) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        res.json({
          success: true,
          lesson: {
            lesson_id: req.lesson.lesson_id,
            lesson_number: req.lesson.lesson_number,
            lesson_date: formatDateOnly(req.lesson.lesson_date),
            start_time: formatTimeOnly(req.lesson.start_time),
            end_time: formatTimeOnly(req.lesson.end_time),
            course_id: req.lesson.course_id,
            course_description: req.lesson.course_description,
            substitute_instructor_id: req.lesson.substitute_instructor_id,
            substitute_name: req.lesson.substitute_instructor_id
              ? `${req.lesson.substitute_first_name} ${req.lesson.substitute_last_name}`
              : null,
            last_change: changeRows[0] || null,
            // tells the client whether the Save button should be enabled
            can_take_attendance: canTakeAttendance(
              req.lesson.lesson_date,
              req.lesson.start_time,
              req.course.end_date,
            ),
          },
          students,
        });
      });
    });
  },
);

// POST save the attendance of a whole lesson
// body: { records: [ { user_id, attended: 'present' | 'absent' }, ... ] }
// url: /api/instructor/lessons/:lesson_id/attendance
router.post(
  "/lessons/:lesson_id/attendance",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsLesson,
  validateAttendanceBody,
  // the time window is checked before the roster so a lesson that has not
  // started yet reports that, rather than complaining about the students
  validateAttendanceAllowed,
  validateUsersRegisteredToLessonCourse,
  (req, res) => {
    const lessonId = req.params.lesson_id;
    const { records } = req.body;

    instructorQ.saveAttendance(lessonId, records, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // hand back the saved roster so the client shows exactly what was stored
      instructorQ.getLessonAttendance(lessonId, (err2, students) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        res.json({
          success: true,
          message: "Attendance saved successfully",
          students,
        });
      });
    });
  },
);

// GET one of the instructor's courses with its lessons and attendance
// url: /api/instructor/courses/:course_id/details
router.get(
  "/courses/:course_id/details",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsCourse,
  (req, res) => {
    courseQ.getCourseWithDetails(req.params.course_id, (err, course) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({ success: true, course });
    });
  },
);

// GET all lessons in a specific course
// url: /api/instructor/courses/:course_id/lessons
router.get(
  "/courses/:course_id/lessons",
  requireLogin,
  requireInstructor,
  validateInstructorOwnsCourse,
  (req, res) => {
    const { course_id } = req.params;

    instructorQ.getCourseLessons(course_id, (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        lessons: rows,
      });
    });
  },
);

// GET the logged-in instructor's own lessons that fall inside a date range,
// used to warn them before submitting a time-off request that overlaps
// lessons they're scheduled to teach
// url: /api/instructor/constraints/lessons-in-range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get(
  "/constraints/lessons-in-range",
  requireLogin,
  requireInstructor,
  validateLessonsInRangeQuery,
  (req, res) => {
    const instructorId = req.session.user.user_id;
    const { start_date, end_date } = req.query;

    instructorQ.getLessonsInRangeForInstructor(
      instructorId,
      start_date,
      end_date,
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
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
        }));

        res.json({
          success: true,
          lessons,
        });
      },
    );
  },
);

// POST add constraint
// url: /api/instructor/constraints
router.post(
  "/constraints",
  requireLogin,
  requireInstructor,
  validateAddConstraint,
  validateDuplicateConstraint,
  validateOverlappingConstraint,
  (req, res) => {
    const constraint = req.body;

    constraint.user_id = req.session.user.user_id;

    instructorQ.addConstraint(constraint, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Constraint added successfully",
      });
    });
  },
);

// GET the constraints the logged-in instructor has submitted
// url: /api/instructor/constraints
router.get("/constraints", requireLogin, requireInstructor, (req, res) => {
  const instructorId = req.session.user.user_id;

  instructorQ.getConstraintsByInstructor(instructorId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const constraints = rows.map((row) => ({
      constraints_id: row.constraints_id,
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
});

module.exports = router;
