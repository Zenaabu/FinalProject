const express = require("express");
const router = express.Router();

const { requireLogin, requireAdmin } = require("../validations/authValidation");
const {
  validateCanCreatePayPalOrder,
} = require("../validations/usersValidations");
const {
  isInstructor,
  validateAddCourse,
  validateLessonsDetails,
  validateDuplicateCourse,
  validateInstructorLessonConflict,
  validateCourseExists,
  validateCourseExistsAndCanAddLessons,
  validateAddLessonsToExistingCourse,
  validateInstructorLessonConflictForExistingCourse,
  validateLessonConflictInSameCourse,
} = require("../validations/adminValidations");

const courseQ = require("../queries/courseQueries");
const adminQ = require("../queries/adminQueries");
const userQ = require("../queries/usersQueries");
const paypalService = require("../services/paypalService");

// ─── Admin course endpoints ────────────────────────────────────────────────

// GET all courses
// url: /api/courses
router.get("/", requireLogin, requireAdmin, (req, res) => {
  courseQ.deactivateExpiredCourses((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    courseQ.getAllCourses((err2, rows) => {
      if (err2) {
        return res.status(500).json({ success: false, message: err2.message });
      }

      res.json({ success: true, courses: rows });
    });
  });
});

// GET all courses with nested lessons and attendance
// url: /api/courses/details
router.get("/details", requireLogin, requireAdmin, (req, res) => {
  courseQ.getCoursesWithDetails((err, courses) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({ success: true, courses });
  });
});

// POST add course
// url: /api/courses
router.post(
  "/",
  requireLogin,
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
        return res.status(500).json({ success: false, message: err.message });
      }

      const courseId = result.insertId;

      adminQ.addLessonsToCourse(courseId, lessons, (err2) => {
        if (err2) {
          return res
            .status(500)
            .json({ success: false, message: err2.message });
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

// PUT update course details
// url: /api/courses/:course_id
router.put(
  "/:course_id",
  requireLogin,
  requireAdmin,
  validateCourseExists,
  (req, res) => {
    const { course_id } = req.params;
    const {
      description,
      level,
      status,
      user_id,
      start_date,
      end_date,
      capacity,
      price,
      vat_percent,
    } = req.body;

    const fields = {};
    if (description !== undefined) fields.description = description;
    if (level !== undefined) fields.level = level;
    if (status !== undefined) fields.is_active = status === "Active" ? 1 : 0;
    if (user_id !== undefined) fields.user_id = user_id;
    if (start_date !== undefined) fields.start_date = start_date;
    if (end_date !== undefined) fields.end_date = end_date;
    if (capacity !== undefined) fields.capacity = Number(capacity);
    if (price !== undefined) fields.price = Number(price);
    if (vat_percent !== undefined) fields.vat_percent = Number(vat_percent);

    if (Object.keys(fields).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    courseQ.updateCourse(course_id, fields, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, message: "Course updated successfully" });
    });
  },
);

// POST add lessons to an existing course
// url: /api/courses/:course_id/lessons
router.post(
  "/:course_id/lessons",
  requireLogin,
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
        return res.status(500).json({ success: false, message: err.message });
      }

      res
        .status(201)
        .json({ success: true, message: "Lessons added successfully" });
    });
  },
);

// ─── User-facing course endpoints (PayPal / registration) ─────────────────

router.post(
  "/:course_id/paypal/create-order",
  requireLogin,
  validateCanCreatePayPalOrder,
  async (req, res) => {
    try {
      const { course_id } = req.params;
      const user_id = req.session.user.user_id;
      const course = req.course;
      const order = await paypalService.createOrder(course.price, course_id);
      const approveLink = order.links.find(
        (link) => link.rel === "approve",
      )?.href;

      userQ.createCourseReservation(
        user_id,
        course_id,
        order.id,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.status(201).json({
            success: true,
            order_id: order.id,
            reservation_id: result.insertId,
            approve_link: approveLink,
          });
        },
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

// POST capture PayPal order
// url: /api/courses/:course_id/paypal/capture-order
router.post(
  "/:course_id/paypal/capture-order",
  requireLogin,
  async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.session.user.user_id;
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    userQ.findPendingReservation(
      order_id,
      user_id,
      course_id,
      async (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (!rows || rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Pending reservation not found or expired",
          });
        }

        const reservation = rows[0];

        try {
          const capture = await paypalService.captureOrder(order_id);

          if (capture.status !== "COMPLETED") {
            userQ.failReservation(reservation.reservation_id, () => {});

            return res.status(400).json({
              success: false,
              message: "Payment was not completed",
            });
          }

          const receipt_number = capture.id;

          userQ.isUserRegistered(user_id, course_id, (checkErr, regRows) => {
            if (checkErr) {
              return res.status(500).json({
                success: false,
                message: checkErr.message,
              });
            }

            if (regRows.length > 0) {
              userQ.failReservation(reservation.reservation_id, () => {});

              return res.status(409).json({
                success: false,
                message: "You are already registered to this course",
              });
            }

            userQ.getCourseTakenPlaces(course_id, (placeErr, placeRows) => {
              if (placeErr) {
                return res.status(500).json({
                  success: false,
                  message: placeErr.message,
                });
              }

              const places = placeRows[0];

              const taken =
                Number(places.registered_count) + Number(places.pending_count);

              if (taken > Number(places.capacity)) {
                userQ.failReservation(reservation.reservation_id, () => {});

                return res.status(409).json({
                  success: false,
                  message: "Course is full",
                });
              }

              userQ.completeCourseRegistration(
                user_id,
                course_id,
                reservation.reservation_id,
                receipt_number,
                (err2) => {
                  if (err2) {
                    return res.status(500).json({
                      success: false,
                      message: err2.message,
                    });
                  }

                  res.json({
                    success: true,
                    message:
                      "Payment completed and user registered successfully",
                    receipt_number,
                  });
                },
              );
            });
          });
        } catch (captureErr) {
          userQ.failReservation(reservation.reservation_id, () => {});

          res.status(500).json({
            success: false,
            message: captureErr.message,
          });
        }
      },
    );
  },
);

module.exports = router;
