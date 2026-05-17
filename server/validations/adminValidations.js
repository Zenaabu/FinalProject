const {
  validateRole,
  validateBlockedStatusValue,
  validateCourseDates,
  isValidLessonSequence,
  validateLessonDate,
  validateLessonTime,
  hasLessonConflict,
} = require("./utils");

const userQ = require("../queries/usersQueries");
const adminQ = require("../queries/adminQueries");
const courseQ = require("../queries/courseQueries");

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
    vat_percent,
    start_date,
    end_date,
  } = req.body;

  if (
    !description ||
    !level ||
    !price ||
    !capacity ||
    !total_lessons ||
    !vat_percent ||
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
    Number(total_lessons) <= 0 ||
    Number(vat_percent) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Numbers must be valid",
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

// a middleware that validates that there is an existing course with the same course_id
// and the course is not active so we can add lessons
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

    const course = rows[0];

    if (course.is_active === 1) {
      return res.status(409).json({
        success: false,
        message: "Cannot add lessons to an active course",
      });
    }

    req.course = course;
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

  next();
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
};
