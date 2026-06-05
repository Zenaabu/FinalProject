const express = require("express");
const router = express.Router();

const adminQ = require("../queries/adminQueries");
const courseQ = require("../queries/courseQueries");

const { requireLogin, requireAdmin } = require("../validations/authValidation");
const {
  validateRoleUpdate,
  validateBlockedStatus,
  validateVideoUpload,
  validateAddCourse,
  validateLessonsDetails,
  validateDuplicateCourse,
  validateInstructorLessonConflict,
  isInstructor,
  validateCourseExistsAndCanAddLessons,
  validateAddLessonsToExistingCourse,
  validateInstructorLessonConflictForExistingCourse,
  validateLessonConflictInSameCourse,
  validateUpdateCourse,
} = require("../validations/adminValidations");
const { checkUserExists } = require("../validations/userValidations");

const upload = require("../middlewares/uploadVideo");

// GET all users
// url: /api/admin/users
router.get("/users", requireLogin, requireAdmin, (req, res) => {
  adminQ.getAllUsers((err, rows) => {
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

// GET all courses
// url: /api/admin/courses
router.get("/courses", requireAdmin, (req, res) => {
  courseQ.getAllCourses((err, rows) => {
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

// GET all courses with nested lessons and attendance
// url: /api/admin/courses/details
router.get("/courses/details", requireLogin, requireAdmin, (req, res) => {
  courseQ.getCoursesWithDetails((err, courses) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      courses,
    });
  });
});

// POST add course
// url: /api/admin/add-course
router.post(
  "/add-course",
  requireAdmin,
  isInstructor,
  validateAddCourse,
  validateLessonsDetails,
  validateDuplicateCourse,
  validateInstructorLessonConflict,
  (req, res) => {
    const course = req.body;
    const lessons = req.body.lessons;

    courseQ.addCourse(course, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      const courseId = result.insertId;

      adminQ.addLessonsToCourse(courseId, lessons, (err2) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "Course and lessons added successfully",
          course_id: courseId,
        });
      });
    });
  },
);

// POST add lessons to an existing course
// url: /api/admin/courses/:course_id/lessons
router.post(
  "/courses/:course_id/lessons",
  requireAdmin,
  validateCourseExistsAndCanAddLessons,
  validateAddLessonsToExistingCourse,
  validateLessonConflictInSameCourse,
  validateInstructorLessonConflictForExistingCourse,
  (req, res) => {
    const courseId = req.params.course_id;
    const { lessons } = req.body;

    adminQ.addLessonsToCourse(courseId, lessons, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Lessons added successfully",
      });
    });
  },
);

// PUT update course
// url: /api/admin/courses/:course_id
//
// Body fields (all optional — only provided fields are updated):
//   description, level, capacity, price, vat_percent,
//   start_date, end_date, user_id (instructor), status ("Active"|"Inactive")
//
// Conflict rule:
//   The instructor cannot have another active course whose date range overlaps
//   with the new [start_date, end_date]. The course being edited is excluded
//   from the conflict check.
router.put(
  "/courses/:course_id",
  requireLogin,
  requireAdmin,
  validateUpdateCourse,
  (req, res) => {
    const { course_id } = req.params;
    const fields = req.body;

    // Step 1 — fetch the current course row so we can fill in omitted fields
    courseQ.findCourseById(course_id, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const current = rows[0];

      // Determine the effective instructor and dates (new value or keep current)
      const effectiveUserId =
        fields.user_id !== undefined ? fields.user_id : current.user_id;
      const effectiveStart =
        fields.start_date !== undefined
          ? fields.start_date
          : current.start_date;
      const effectiveEnd =
        fields.end_date !== undefined ? fields.end_date : current.end_date;

      // Step 2 — check that no OTHER active course for this instructor overlaps
      //          the (possibly new) date range
      courseQ.checkDateConflictExcludingCourse(
        effectiveUserId,
        effectiveStart,
        effectiveEnd,
        course_id,
        (err2, conflictRows) => {
          if (err2) {
            return res
              .status(500)
              .json({ success: false, message: err2.message });
          }

          if (conflictRows.length > 0) {
            return res.status(409).json({
              success: false,
              message:
                "This instructor already has an active course in the same time period",
            });
          }

          // Map status string → is_active integer (1 / 0)
          let isActive = current.is_active;
          if (fields.status === "Active") isActive = 1;
          if (fields.status === "Inactive") isActive = 0;

          // Step 3 — update the course
          courseQ.updateCourse(
            course_id,
            {
              description:
                fields.description !== undefined
                  ? fields.description
                  : current.description,
              level: fields.level !== undefined ? fields.level : current.level,
              capacity:
                fields.capacity !== undefined
                  ? Number(fields.capacity)
                  : current.capacity,
              price:
                fields.price !== undefined
                  ? Number(fields.price)
                  : current.price,
              vat_percent:
                fields.vat_percent !== undefined
                  ? Number(fields.vat_percent)
                  : current.vat_percent,
              start_date: effectiveStart,
              end_date: effectiveEnd,
              user_id: effectiveUserId,
              is_active: isActive,
            },
            (err3) => {
              if (err3) {
                return res
                  .status(500)
                  .json({ success: false, message: err3.message });
              }

              res.json({
                success: true,
                message: "Course updated successfully",
              });
            },
          );
        },
      );
    });
  },
);

module.exports = router;
