const {
  validateRole,
  validateBlockedStatusValue,
  validateCourseDates,
  isValidLessonSequence,
  validateLessonDate,
  validateLessonTime,
  hasLessonConflict,
} = require("./utils");

const adminQ = require("../queries/adminQueries");

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

  adminQ.checkDuplicateCourse(course, (err, rows) => {
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
  const { user_id, lessons } = req.body;

  adminQ.getInstructorLessonsInRange(
    user_id,
    req.body.start_date,
    req.body.end_date,
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

module.exports = {
  validateRoleUpdate,
  validateBlockedStatus,
  validateVideoUpload,
  validateAddCourse,
  validateLessonsDetails,
  validateDuplicateCourse,
  validateInstructorLessonConflict,
};
