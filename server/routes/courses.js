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
  validateUpdateCourseDetails,
  validateUpdatedCourseCapacity,
  validateUpdatedCourseTotalLessons,
  validateUpdatedCourseDatesIncludeLessons,
  validateUpdatedCourseInstructorConflict,
  validateLessonExists,
  validateLessonNotAlreadyPassed,
  validateLessonCourseExists,
  validateUpdateLessonDetails,
  validateUpdatedLessonNoConflict,
  validateUpdatedLessonInstructorConflict,
  validateUpdatedLessonDateOrder,
  validateSubstituteInstructor,
  validateRescheduledLessonAvoidsApprovedConstraint,
} = require("../validations/adminValidations");

const courseQ = require("../queries/courseQueries");
const adminQ = require("../queries/adminQueries");
const userQ = require("../queries/usersQueries");
const paypalService = require("../services/paypalService");
const { formatDateOnly, formatTimeOnly } = require("../validations/utils");

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
  courseQ.deactivateExpiredCourses((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    courseQ.getCoursesWithDetails((err2, courses) => {
      if (err2) {
        return res.status(500).json({ success: false, message: err2.message });
      }

      res.json({ success: true, courses });
    });
  });
});

// GET the courses the logged in user can still register to
// url: /api/courses/available
router.get("/available", requireLogin, (req, res) => {
  const user_id = req.session.user.user_id;

  // free up seats held by abandoned checkouts before counting
  courseQ.expireOldReservations((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    courseQ.getAvailableCourses(user_id, (err2, rows) => {
      if (err2) {
        return res.status(500).json({ success: false, message: err2.message });
      }

      const courses = rows.map((c) => {
        const taken = Number(c.registered_count) + Number(c.pending_count);

        return {
          course_id: c.course_id,
          description: c.description,
          level: c.level,
          start_date: c.start_date,
          end_date: c.end_date,
          capacity: c.capacity,
          price: Number(c.price),
          vat_percent: c.vat_percent,
          total_lessons: c.total_lessons,
          instructor: c.instructor ?? "—",
          seats_left: Math.max(0, Number(c.capacity) - taken),
          is_registered: Number(c.is_registered) > 0,
        };
      });

      res.json({ success: true, courses });
    });
  });
});

// GET the courses the logged in user is registered to, each with its next
// upcoming lesson (or null if the course has no lesson left to attend)
// url: /api/courses/my-courses
router.get("/my-courses", requireLogin, (req, res) => {
  const user_id = req.session.user.user_id;

  courseQ.getMyCourses(user_id, (err, courses) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (courses.length === 0) {
      return res.json({ success: true, courses: [] });
    }

    const courseIds = courses.map((c) => c.course_id);

    courseQ.getLessonsForCourses(courseIds, (err2, lessons) => {
      if (err2) {
        return res.status(500).json({ success: false, message: err2.message });
      }

      const lessonsByCourse = {};
      for (const lesson of lessons) {
        if (!lessonsByCourse[lesson.course_id]) {
          lessonsByCourse[lesson.course_id] = [];
        }
        lessonsByCourse[lesson.course_id].push(lesson);
      }

      const now = new Date();

      const result = courses.map((c) => {
        const courseLessons = lessonsByCourse[c.course_id] || [];

        // lessons are pre-sorted by date/time, so the first one that has not
        // ended yet is the next lesson
        const upcoming = courseLessons.find(
          (l) => new Date(`${l.date}T${l.end_time}:00`) >= now,
        );

        return {
          course_id: c.course_id,
          description: c.description,
          level: c.level,
          start_date: c.start_date,
          end_date: c.end_date,
          total_lessons: c.total_lessons,
          is_active: c.is_active,
          instructor: c.instructor ?? "—",
          next_lesson: upcoming
            ? {
                lesson_id: upcoming.lesson_id,
                lesson_number: upcoming.lesson_number,
                date: upcoming.date,
                start_time: upcoming.start_time,
                end_time: upcoming.end_time,
              }
            : null,
        };
      });

      res.json({ success: true, courses: result });
    });
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

        // return the assembled course so the dashboard can show it right away
        courseQ.getCourseWithDetails(courseId, (err3, newCourse) => {
          if (err3) {
            return res
              .status(500)
              .json({ success: false, message: err3.message });
          }

          res.status(201).json({
            success: true,
            message: "Course and lessons added successfully",
            course_id: courseId,
            course: newCourse,
          });
        });
      });
    });
  },
);

// GET a single course with its lessons and attendance
// url: /api/courses/:course_id
router.get(
  "/:course_id",
  requireLogin,
  requireAdmin,
  validateCourseExists,
  (req, res) => {
    courseQ.getCourseWithDetails(req.params.course_id, (err, course) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, course });
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
  validateUpdateCourseDetails,
  validateUpdatedCourseCapacity,
  validateUpdatedCourseTotalLessons,
  validateUpdatedCourseDatesIncludeLessons,
  validateUpdatedCourseInstructorConflict,
  (req, res) => {
    const { course_id } = req.params;

    // req.updatedCourse is built by validateUpdateCourseDetails and already
    // uses the DB column names
    courseQ.updateCourse(course_id, req.updatedCourse, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      // return the fresh course so the client can refresh the card without
      // having to re-map field names itself
      courseQ.getCourseWithDetails(course_id, (err2, course) => {
        if (err2) {
          return res
            .status(500)
            .json({ success: false, message: err2.message });
        }

        res.json({
          success: true,
          message: "Course updated successfully",
          course,
        });
      });
    });
  },
);

// GET every user registered to a course
// url: /api/courses/:course_id/registrations
router.get(
  "/:course_id/registrations",
  requireLogin,
  requireAdmin,
  validateCourseExists,
  (req, res) => {
    courseQ.getCourseRegistrations(req.params.course_id, (err, registrations) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, registrations });
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

// GET all lessons of a course
// url: /api/courses/:course_id/lessons
router.get(
  "/:course_id/lessons",
  requireLogin,
  requireAdmin,
  validateCourseExists,
  (req, res) => {
    adminQ.getLessonsByCourseId(req.params.course_id, (err, lessons) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({ success: true, lessons });
    });
  },
);

// PUT update a single lesson of a course
// url: /api/courses/:course_id/lessons/:lesson_id
router.put(
  "/:course_id/lessons/:lesson_id",
  requireLogin,
  requireAdmin,
  validateLessonExists,
  validateLessonNotAlreadyPassed,
  validateLessonCourseExists,
  validateUpdateLessonDetails,
  validateUpdatedLessonNoConflict,
  validateUpdatedLessonInstructorConflict,
  validateUpdatedLessonDateOrder,
  validateRescheduledLessonAvoidsApprovedConstraint,
  (req, res) => {
    const { course_id, lesson_id } = req.params;
    // present only when this edit came from Staff Scheduling, resolving a
    // specific approved instructor constraint
    const { constraints_id } = req.query;

    // only the three schedule fields may change — lesson_number keeps the
    // order of the course and is not editable
    const fields = {
      lesson_date: req.updatedLesson.lesson_date,
      start_time: req.updatedLesson.start_time,
      end_time: req.updatedLesson.end_time,
    };

    const dateChanged =
      formatDateOnly(req.lesson.lesson_date) !==
        formatDateOnly(req.updatedLesson.lesson_date) ||
      formatTimeOnly(req.lesson.start_time) !==
        formatTimeOnly(req.updatedLesson.start_time) ||
      formatTimeOnly(req.lesson.end_time) !==
        formatTimeOnly(req.updatedLesson.end_time);

    // TODO: this is the reschedule path used to resolve an approved
    // instructor constraint (see /admin/staff) — once the messaging system
    // exists, notify the lesson's registered students that it moved here.
    adminQ.updateLesson(lesson_id, fields, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      function respondWithCourse() {
        // hand back the whole course so the accordion can refresh in one go
        courseQ.getCourseWithDetails(course_id, (err2, course) => {
          if (err2) {
            return res
              .status(500)
              .json({ success: false, message: err2.message });
          }

          res.json({
            success: true,
            message: "Lesson updated successfully",
            course,
          });
        });
      }

      if (!dateChanged) return respondWithCourse();

      const details = `Rescheduled from ${formatDateOnly(req.lesson.lesson_date)} ${formatTimeOnly(req.lesson.start_time)}–${formatTimeOnly(req.lesson.end_time)} to ${formatDateOnly(req.updatedLesson.lesson_date)} ${formatTimeOnly(req.updatedLesson.start_time)}–${formatTimeOnly(req.updatedLesson.end_time)}`;

      adminQ.addLessonHistory(
        {
          lesson_id,
          constraints_id: constraints_id || null,
          change_type: "rescheduled",
          details,
          changed_by: req.session.user.user_id,
        },
        (err3) => {
          if (err3) {
            return res
              .status(500)
              .json({ success: false, message: err3.message });
          }

          respondWithCourse();
        },
      );
    });
  },
);

// PUT assign (or clear, with substitute_instructor_id: null) a substitute
// instructor for a single lesson — used to cover a lesson that falls inside
// an approved instructor constraint without reassigning the whole course
// url: /api/courses/:course_id/lessons/:lesson_id/substitute
router.put(
  "/:course_id/lessons/:lesson_id/substitute",
  requireLogin,
  requireAdmin,
  validateLessonExists,
  validateLessonNotAlreadyPassed,
  validateLessonCourseExists,
  validateSubstituteInstructor,
  (req, res) => {
    const { course_id, lesson_id } = req.params;
    // present only when this edit came from Staff Scheduling, resolving a
    // specific approved instructor constraint
    const { constraints_id } = req.query;

    adminQ.updateLesson(
      lesson_id,
      { substitute_instructor_id: req.substituteInstructorId },
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: err.message });
        }

        function respondWithCourse() {
          courseQ.getCourseWithDetails(course_id, (err2, course) => {
            if (err2) {
              return res
                .status(500)
                .json({ success: false, message: err2.message });
            }

            res.json({
              success: true,
              message: req.substituteInstructorId
                ? "Substitute assigned"
                : "Substitute cleared",
              course,
            });
          });
        }

        const historyEntry = req.substituteInstructorId
          ? {
              change_type: "substitute_assigned",
              details: `Covered by ${req.substituteInstructorName}`,
            }
          : {
              change_type: "substitute_cleared",
              details: "Substitute removed",
            };

        adminQ.addLessonHistory(
          {
            lesson_id,
            constraints_id: constraints_id || null,
            change_type: historyEntry.change_type,
            details: historyEntry.details,
            changed_by: req.session.user.user_id,
          },
          (err3) => {
            if (err3) {
              return res
                .status(500)
                .json({ success: false, message: err3.message });
            }

            respondWithCourse();
          },
        );
      },
    );
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

          // PayPal's capture id is a string like "5O190127TN364715T" — it is
          // kept in its own column, the receipt number is generated by the DB
          const paypal_capture_id = capture.id;

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
                paypal_capture_id,
                (err2, receipt_number) => {
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
                    paypal_capture_id,
                  });
                },
              );
            });
          });
        } catch (captureErr) {
          userQ.failReservation(reservation.reservation_id, () => {});

          // PayPal's actual reason (e.g. "ORDER_ALREADY_CAPTURED" if the user
          // hit back/forward after paying) is in the response body — axios's
          // own message is just "Request failed with status code 422"
          const paypalMessage =
            captureErr.response?.data?.details?.[0]?.description ||
            captureErr.response?.data?.message;

          res.status(500).json({
            success: false,
            message: paypalMessage || captureErr.message,
          });
        }
      },
    );
  },
);

module.exports = router;
