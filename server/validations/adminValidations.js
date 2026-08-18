const {
  validateRole,
  validateBlockedStatusValue,
  validateCourseDates,
  isValidLessonSequence,
  validateLessonDate,
  validateLessonTime,
  hasLessonConflict,
  hasSameCourseDateConflict,
  hasDuplicateLessonDates,
  areValidLessonUpdateFields,
  buildUpdatedLesson,
  validateLessonNumber,
  isValidLessonDateOrder,
  isFutureLessonDate,
  areValidCourseUpdateFields,
  buildUpdatedCourse,
  validateCourseUpdateDates,
} = require("./utils");

const userQ = require("../queries/usersQueries");
const adminQ = require("../queries/adminQueries");
const courseQ = require("../queries/courseQueries");

// a course cannot be scheduled with more lessons than this — keeps course
// length sane and avoids pathological numbers of lesson rows/roster queries
const MAX_TOTAL_LESSONS = 12;

// a middleware that validates the role (when updating it)
function validateRoleUpdate(req, res, next) {
  const { user_id } = req.params;
  const { role } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User id is required",
    });
  }

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role is required",
    });
  }

  if (!validateRole(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  next();
}

// a middleware that validates the is_blocked value
function validateBlockedStatus(req, res, next) {
  const { user_id } = req.params;
  const { is_blocked } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User id is required",
    });
  }

  if (is_blocked === undefined) {
    return res.status(400).json({
      success: false,
      message: "is_blocked is required",
    });
  }

  if (!validateBlockedStatusValue(is_blocked)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blocked status",
    });
  }

  next();
}

// a middleware that validates the video upload
function validateVideoUpload(req, res, next) {
  const { title, description } = req.body;

  // check title
  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  // check description
  if (!description || description.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  // check file
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Video file is required",
    });
  }

  next();
}

// a middleware that validates add course request
function validateAddCourse(req, res, next) {
  const {
    description,
    level,
    price,
    capacity,
    total_lessons,
    start_date,
    end_date,
  } = req.body;

  if (
    !description ||
    !level ||
    !price ||
    !capacity ||
    !total_lessons ||
    !start_date ||
    !end_date
  ) {
    return res.status(400).json({
      success: false,
      message: "All course fields are required",
    });
  }

  if (!["beginner", "intermediate", "advanced"].includes(level)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course level",
    });
  }

  if (
    Number(price) <= 0 ||
    Number(capacity) <= 0 ||
    Number(total_lessons) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Numbers must be valid",
    });
  }

  if (Number(total_lessons) > MAX_TOTAL_LESSONS) {
    return res.status(400).json({
      success: false,
      message: `Total lessons cannot be more than ${MAX_TOTAL_LESSONS}`,
    });
  }

  if (!validateCourseDates(start_date, end_date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course dates!",
    });
  }

  next();
}

// a middleware that checks if the lesson details are valid
function validateLessonsDetails(req, res, next) {
  const { lessons, total_lessons, start_date, end_date } = req.body;

  if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Course must have at least one lesson",
    });
  }

  if (lessons.length > Number(total_lessons)) {
    return res.status(400).json({
      success: false,
      message: "Number of lessons cannot be greater than total lessons",
    });
  }

  for (const lesson of lessons) {
    const { lesson_number, lesson_date, start_time, end_time } = lesson;

    if (!lesson_number || !lesson_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "All lesson fields are required",
      });
    }

    const lessonNumber = Number(lesson_number);

    if (!Number.isInteger(lessonNumber) || lessonNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Lesson number must be a positive integer",
      });
    }

    if (lessonNumber > Number(total_lessons)) {
      return res.status(400).json({
        success: false,
        message: "Lesson number cannot be greater than total lessons",
      });
    }

    if (!validateLessonDate(lesson_date, start_date, end_date)) {
      return res.status(400).json({
        success: false,
        message: "Lesson date must be between course start date and end date",
      });
    }

    if (!validateLessonTime(start_time, end_time)) {
      return res.status(400).json({
        success: false,
        message: "Lesson start time must be before lesson end time",
      });
    }
  }

  if (!isValidLessonSequence(0, lessons)) {
    return res.status(400).json({
      success: false,
      message: "Lesson numbers must start from 1 and be sequential",
    });
  }

  // a course meets at most once per day — two of its own lessons can never
  // share a calendar date
  if (hasDuplicateLessonDates(lessons)) {
    return res.status(400).json({
      success: false,
      message: "A course cannot have two lessons on the same date",
    });
  }

  next();
}

// a middleware that checks if their is a duplicated course in the db
function validateDuplicateCourse(req, res, next) {
  const course = req.body;

  courseQ.checkDuplicateCourse(course, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This course already exists for this instructor in the same period and time",
      });
    }

    next();
  });
}

// a middleware that checks if the lessons are valid within the instructor id
function validateInstructorLessonConflict(req, res, next) {
  const { user_id, start_date, end_date, lessons } = req.body;

  checkInstructorLessonConflict(
    user_id,
    start_date,
    end_date,
    lessons,
    res,
    next,
  );
}

// a middleware that checks if the user_id is for an instructor
function isInstructor(req, res, next) {
  const { user_id } = req.body;

  userQ.findRole(user_id, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    // user not found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // user is not instructor
    if (rows[0].role !== "instructor") {
      return res.status(409).json({
        success: false,
        message: "The user is not an instructor!",
      });
    }

    next();
  });
}

// a middleware that validates that there is an existing course with the same
// course_id so we can add lessons to it. lessons may be added to a running
// course — the lesson itself still has to be in the future, which
// validateAddLessonsToExistingCourse enforces
function validateCourseExistsAndCanAddLessons(req, res, next) {
  const courseId = req.params.course_id;

  courseQ.findCourseById(courseId, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    req.course = rows[0];
    next();
  });
}

// a middleware that validates the lessons before adding them to an existing course
function validateAddLessonsToExistingCourse(req, res, next) {
  const { lessons } = req.body;
  const course = req.course;

  if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Lessons are required",
    });
  }

  for (const lesson of lessons) {
    if (
      !lesson.lesson_number ||
      !lesson.lesson_date ||
      !lesson.start_time ||
      !lesson.end_time
    ) {
      return res.status(400).json({
        success: false,
        message: "All lesson fields are required",
      });
    }

    if (
      !validateLessonDate(
        lesson.lesson_date,
        course.start_date,
        course.end_date,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Lesson date must be inside course dates",
      });
    }

    if (!validateLessonTime(lesson.start_time, lesson.end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson time",
      });
    }
    const lessonNumber = Number(lesson.lesson_number);

    if (!Number.isInteger(lessonNumber) || lessonNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Lesson number must be a positive integer",
      });
    }

    if (lessonNumber > Number(course.total_lessons)) {
      return res.status(400).json({
        success: false,
        message: "Lesson number cannot be greater than total lessons",
      });
    }

    if (!isFutureLessonDate(lesson.lesson_date)) {
      return res.status(400).json({
        success: false,
        message: "A new lesson cannot be scheduled in the past",
      });
    }
  }

  // a course meets at most once per day — two of its own lessons can never
  // share a calendar date
  if (hasDuplicateLessonDates(lessons)) {
    return res.status(400).json({
      success: false,
      message: "A course cannot have two lessons on the same date",
    });
  }

  adminQ.getMaxLessonNumber(course.course_id, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const maxLesson = rows[0].maxLesson || 0;

    if (!isValidLessonSequence(maxLesson, lessons)) {
      return res.status(400).json({
        success: false,
        message: "Lesson numbers must continue the existing sequence",
      });
    }

    next();
  });
}

// not for export
// a middleware that gets the id of the instructor, start and end date of the course,
// and lessons array. it validates that there is no conflict in instructor lessons
function checkInstructorLessonConflict(
  user_id,
  start_date,
  end_date,
  lessons,
  res,
  next,
) {
  adminQ.getInstructorLessonsInRange(
    user_id,
    start_date,
    end_date,
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (hasLessonConflict(rows, lessons)) {
        return res.status(409).json({
          success: false,
          message: "Instructor already has a lesson at this date and time",
        });
      }

      next();
    },
  );
}

// a middleware that validates that there is no conflict in the instructor lessons
// when adding the lessons to an existing course
function validateInstructorLessonConflictForExistingCourse(req, res, next) {
  const { lessons } = req.body;
  const course = req.course;

  checkInstructorLessonConflict(
    course.user_id,
    course.start_date,
    course.end_date,
    lessons,
    res,
    next,
  );
}

// a middleware that checks if there is no lesson in the course on the same
// date already — a course meets at most once per day
function validateLessonConflictInSameCourse(req, res, next) {
  const courseId = req.params.course_id;
  const { lessons } = req.body;

  adminQ.getLessonsByCourseId(courseId, (err, existingLessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (hasSameCourseDateConflict(existingLessons, lessons)) {
      return res.status(409).json({
        success: false,
        message: "This course already has a lesson on this date",
      });
    }

    next();
  });
}

// a middleware that validates the vatPercent
function validateVatUpdate(req, res, next) {
  const { vat_percent } = req.body;

  if (vat_percent === undefined || vat_percent === "") {
    return res.status(400).json({
      success: false,
      message: "VAT percent is required",
    });
  }

  const vat = Number(vat_percent);

  if (isNaN(vat) || vat < 0 || vat > 100) {
    return res.status(400).json({
      success: false,
      message: "VAT percent must be between 0 and 100",
    });
  }

  req.vat_percent = vat;

  next();
}

// a middleware that checks if the course exists and attaches it to the request
// so the middlewares after it can validate against the current values
function validateCourseExists(req, res, next) {
  const courseId = req.params.course_id;

  courseQ.findCourseById(courseId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    req.course = rows[0];
    next();
  });
}

// a middleware that checks if lesson exists. when the route also carries a
// course_id, the lesson must belong to that course
function validateLessonExists(req, res, next) {
  const lessonId = req.params.lesson_id;
  const courseId = req.params.course_id;

  adminQ.findLessonById(lessonId, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (courseId !== undefined && Number(rows[0].course_id) !== Number(courseId)) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      });
    }

    req.lesson = rows[0];
    next();
  });
}

// a middleware that checks if the course exists within the lesson we
// want to update
function validateLessonCourseExists(req, res, next) {
  courseQ.findCourseById(req.lesson.course_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    req.course = rows[0];
    next();
  });
}

// a middleware that validates the update lesson details
function validateUpdateLessonDetails(req, res, next) {
  const sentFields = Object.keys(req.body);

  if (sentFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required",
    });
  }

  if (!areValidLessonUpdateFields(sentFields)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson fields",
    });
  }

  const updatedLesson = buildUpdatedLesson(req.lesson, req.body);

  if (
    !validateLessonNumber(updatedLesson.lesson_number, req.course.total_lessons)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson number",
    });
  }

  if (
    !validateLessonDate(
      updatedLesson.lesson_date,
      req.course.start_date,
      req.course.end_date,
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Lesson date must be inside course dates",
    });
  }

  if (!validateLessonTime(updatedLesson.start_time, updatedLesson.end_time)) {
    return res.status(400).json({
      success: false,
      message: "Lesson start time must be before lesson end time",
    });
  }

  req.updatedLesson = updatedLesson;

  next();
}

// a middleware that validates that moving this lesson doesn't land it on a
// date another lesson of the same course is already using — a course meets
// at most once per day
function validateUpdatedLessonNoConflict(req, res, next) {
  const lessonId = req.params.lesson_id;
  const courseId = req.lesson.course_id;

  adminQ.getLessonsByCourseId(courseId, (err, existingLessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const otherLessons = existingLessons.filter(
      (lesson) => Number(lesson.lesson_id) !== Number(lessonId),
    );

    if (hasSameCourseDateConflict(otherLessons, [req.updatedLesson])) {
      return res.status(409).json({
        success: false,
        message: "Another lesson in this course is already scheduled on this date",
      });
    }

    next();
  });
}

// a middleware that checks that the moved lesson does not collide with a lesson
// the instructor teaches in one of their OTHER courses
// (validateUpdatedLessonNoConflict only looks inside the same course)
function validateUpdatedLessonInstructorConflict(req, res, next) {
  const courseId = req.lesson.course_id;
  const course = req.course;
  const updatedLesson = req.updatedLesson;
  // a lesson covered by a substitute is that substitute's schedule to check,
  // not the course's regular instructor
  const instructorId = req.lesson.substitute_instructor_id || course.user_id;

  adminQ.getInstructorLessonsInRangeExcludingCourse(
    instructorId,
    updatedLesson.lesson_date,
    updatedLesson.lesson_date,
    courseId,
    (err, otherLessons) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (hasLessonConflict(otherLessons, [updatedLesson])) {
        return res.status(409).json({
          success: false,
          message:
            "The instructor already teaches another course at this date and time",
        });
      }

      next();
    },
  );
}

// a middleware that checks if the lessons date order is valid
function validateUpdatedLessonDateOrder(req, res, next) {
  const lessonId = req.params.lesson_id;
  const courseId = req.lesson.course_id;

  adminQ.getLessonsByCourseId(courseId, (err, lessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const updatedLessons = lessons.map((lesson) => {
      if (Number(lesson.lesson_id) === Number(lessonId)) {
        return {
          ...lesson,
          lesson_date: req.updatedLesson.lesson_date,
          start_time: req.updatedLesson.start_time,
          end_time: req.updatedLesson.end_time,
        };
      }

      return lesson;
    });

    if (!isValidLessonDateOrder(updatedLessons)) {
      return res.status(400).json({
        success: false,
        message: "Lesson dates must match lesson number order",
      });
    }

    // only relevant when the date itself moved — a lesson that already took
    // place is rejected earlier by validateLessonNotAlreadyPassed
    if (
      req.body.lesson_date !== undefined &&
      !isFutureLessonDate(req.updatedLesson.lesson_date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Lesson date cannot be in the past",
      });
    }

    next();
  });
}

// a middleware that stops a lesson from being rescheduled onto a date the
// instructor actually teaching it was approved as unavailable for
// (instructor_constraints with status = 'approved') — approving a constraint
// means the admin is handling that gap themselves, so a plain reschedule
// can't quietly put the lesson right back on top of it. a lesson already
// covered by a substitute is checked against the substitute, not the
// course's regular instructor.
function validateRescheduledLessonAvoidsApprovedConstraint(req, res, next) {
  const isSubstitute = Boolean(req.lesson.substitute_instructor_id);
  const instructorId = req.lesson.substitute_instructor_id || req.course.user_id;

  adminQ.findApprovedConstraintOnDate(
    instructorId,
    req.updatedLesson.lesson_date,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (rows.length > 0) {
        const who = isSubstitute ? "substitute instructor" : "instructor";
        const suggestion = isSubstitute
          ? "Choose a different date or assign a different substitute instead."
          : "Choose a different date or assign a substitute instead.";

        return res.status(409).json({
          success: false,
          message: `The ${who} was approved as unavailable on ${req.updatedLesson.lesson_date} ("${rows[0].notes}"). ${suggestion}`,
        });
      }

      next();
    },
  );
}

// a middleware that refuses to change a lesson that has already taken place,
// because its attendance is already recorded
function validateLessonNotAlreadyPassed(req, res, next) {
  if (!isFutureLessonDate(req.lesson.lesson_date)) {
    return res.status(409).json({
      success: false,
      message: "Cannot edit a lesson that has already taken place",
    });
  }

  next();
}

// a middleware that validates the course details
function validateUpdateCourseDetails(req, res, next) {
  const sentFields = Object.keys(req.body);

  if (sentFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required",
    });
  }

  if (!areValidCourseUpdateFields(sentFields)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course fields",
    });
  }

  if (
    req.body.status !== undefined &&
    !["Active", "Inactive"].includes(req.body.status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Status must be either Active or Inactive",
    });
  }

  const updatedCourse = buildUpdatedCourse(req.course, req.body);

  if (!updatedCourse.description || String(updatedCourse.description).trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Course description is required",
    });
  }

  if (!["beginner", "intermediate", "advanced"].includes(updatedCourse.level)) {
    return res.status(400).json({
      success: false,
      message: "Invalid course level",
    });
  }

  if (
    Number(updatedCourse.price) <= 0 ||
    Number(updatedCourse.capacity) <= 0 ||
    Number(updatedCourse.total_lessons) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Numbers must be valid",
    });
  }

  if (Number(updatedCourse.total_lessons) > MAX_TOTAL_LESSONS) {
    return res.status(400).json({
      success: false,
      message: `Total lessons cannot be more than ${MAX_TOTAL_LESSONS}`,
    });
  }

  // an existing course keeps its original start date, so unlike creating a
  // course the start date is allowed to be in the past here
  if (
    (req.body.start_date !== undefined || req.body.end_date !== undefined) &&
    !validateCourseUpdateDates(updatedCourse.start_date, updatedCourse.end_date)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid course dates",
    });
  }

  if (req.body.user_id !== undefined) {
    userQ.findRole(updatedCourse.user_id, (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Instructor not found",
        });
      }

      if (rows[0].role !== "instructor") {
        return res.status(400).json({
          success: false,
          message: "User must be an instructor",
        });
      }

      req.updatedCourse = updatedCourse;
      next();
    });

    return;
  }

  req.updatedCourse = updatedCourse;
  next();
}

// a middleware that validates that the course dates after updating include
// the lessons that already exist in the course
function validateUpdatedCourseDatesIncludeLessons(req, res, next) {
  const courseId = req.params.course_id;
  const updatedCourse = req.updatedCourse;

  adminQ.getLessonsByCourseId(courseId, (err, lessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    for (const lesson of lessons) {
      if (
        !validateLessonDate(
          lesson.lesson_date,
          updatedCourse.start_date,
          updatedCourse.end_date,
        )
      ) {
        return res.status(409).json({
          success: false,
          message: "Course dates cannot exclude existing lessons",
        });
      }
    }

    next();
  });
}

// a middleware that makes sure the new capacity is not smaller than the number
// of users that are already registered to the course
function validateUpdatedCourseCapacity(req, res, next) {
  // capacity was not touched, nothing to check
  if (req.body.capacity === undefined) return next();

  const courseId = req.params.course_id;

  courseQ.countCourseRegistrations(courseId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    const enrolled = Number(rows[0].enrolled);

    if (Number(req.updatedCourse.capacity) < enrolled) {
      return res.status(409).json({
        success: false,
        message: `Capacity cannot be lower than the ${enrolled} users already registered`,
      });
    }

    next();
  });
}

// a middleware that makes sure the new total_lessons is not smaller than the
// number of lessons the course already has
function validateUpdatedCourseTotalLessons(req, res, next) {
  // total_lessons was not touched, nothing to check
  if (req.body.total_lessons === undefined) return next();

  const courseId = req.params.course_id;

  adminQ.getLessonsByCourseId(courseId, (err, lessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (Number(req.updatedCourse.total_lessons) < lessons.length) {
      return res.status(409).json({
        success: false,
        message: `Total lessons cannot be lower than the ${lessons.length} lessons already scheduled`,
      });
    }

    next();
  });
}

// a middleware that makes sure the course lessons do not collide with the other
// lessons of the instructor. it only runs when the instructor or the course
// dates changed, and it ignores the lessons of the course being updated
function validateUpdatedCourseInstructorConflict(req, res, next) {
  const changedInstructor = req.body.user_id !== undefined;
  const changedDates =
    req.body.start_date !== undefined || req.body.end_date !== undefined;

  if (!changedInstructor && !changedDates) return next();

  const courseId = req.params.course_id;
  const updatedCourse = req.updatedCourse;

  adminQ.getLessonsByCourseId(courseId, (err, courseLessons) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    // no lessons yet, so nothing can collide
    if (courseLessons.length === 0) return next();

    adminQ.getInstructorLessonsInRangeExcludingCourse(
      updatedCourse.user_id,
      updatedCourse.start_date,
      updatedCourse.end_date,
      courseId,
      (err2, otherLessons) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        if (hasLessonConflict(otherLessons, courseLessons)) {
          return res.status(409).json({
            success: false,
            message:
              "The instructor already has a lesson at one of this course lesson times",
          });
        }

        next();
      },
    );
  });
}

// a middleware that checks the instructor constraint in the params exists,
// and attaches it to the request
function validateConstraintExists(req, res, next) {
  const constraintsId = req.params.constraints_id;

  adminQ.findConstraintById(constraintsId, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Constraint not found",
      });
    }

    req.constraint = rows[0];
    next();
  });
}

// a middleware that validates the status sent when an admin decides on a
// constraint. 'pending' is not settable here — it is only ever the untouched
// default, never something an admin picks
function validateConstraintStatusValue(req, res, next) {
  const { status } = req.body;

  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({
      success: false,
      message: "Status must be 'approved' or 'rejected'",
    });
  }

  next();
}

// a middleware that validates the substitute instructor sent for a lesson.
// null clears an existing substitute. otherwise it must be a real,
// non-blocked instructor other than the lesson's own instructor, and free of
// a conflicting lesson at that exact date/time
function validateSubstituteInstructor(req, res, next) {
  const { substitute_instructor_id } = req.body;

  if (substitute_instructor_id === null) {
    req.substituteInstructorId = null;
    return next();
  }

  if (!substitute_instructor_id) {
    return res.status(400).json({
      success: false,
      message: "substitute_instructor_id is required (or null to clear)",
    });
  }

  if (substitute_instructor_id === req.course.user_id) {
    return res.status(400).json({
      success: false,
      message: "The substitute must be a different instructor",
    });
  }

  userQ.findUserById(substitute_instructor_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0 || rows[0].role !== "instructor") {
      return res.status(400).json({
        success: false,
        message: "substitute_instructor_id must be an existing instructor",
      });
    }

    if (rows[0].is_blocked === 1) {
      return res.status(400).json({
        success: false,
        message: "This instructor is blocked",
      });
    }

    adminQ.getInstructorLessonsInRange(
      substitute_instructor_id,
      req.lesson.lesson_date,
      req.lesson.lesson_date,
      (err2, existingLessons) => {
        if (err2) {
          return res
            .status(500)
            .json({ success: false, message: err2.message });
        }

        if (hasLessonConflict(existingLessons, [req.lesson])) {
          return res.status(409).json({
            success: false,
            message:
              "This instructor already teaches another lesson at this date and time",
          });
        }

        req.substituteInstructorId = substitute_instructor_id;
        req.substituteInstructorName = `${rows[0].first_name} ${rows[0].last_name}`;
        next();
      },
    );
  });
}

module.exports = {
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
  validateVatUpdate,
  validateCourseExists,
  validateLessonExists,
  validateLessonNotAlreadyPassed,
  validateLessonCourseExists,
  validateUpdateLessonDetails,
  validateUpdatedLessonNoConflict,
  validateUpdatedLessonInstructorConflict,
  validateUpdatedLessonDateOrder,
  validateUpdateCourseDetails,
  validateUpdatedCourseDatesIncludeLessons,
  validateUpdatedCourseCapacity,
  validateUpdatedCourseTotalLessons,
  validateUpdatedCourseInstructorConflict,
  validateConstraintExists,
  validateConstraintStatusValue,
  validateSubstituteInstructor,
  validateRescheduledLessonAvoidsApprovedConstraint,
};
