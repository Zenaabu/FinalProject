const instructorQ = require("../queries/instructorQueries");

const { canTakeAttendance, areValidConstraintFields } = require("./utils");

// the values the attend.attended enum column accepts
const ATTENDANCE_VALUES = ["present", "absent"];

// a middleware that validates that the current logged instructor
// owns the course with the id in the params
function validateInstructorOwnsCourse(req, res, next) {
  const courseId = req.params.course_id;
  const instructorId = req.session.user.user_id;

  instructorQ.findInstructorCourse(courseId, instructorId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "This course does not belong to you",
      });
    }

    req.course = rows[0];
    next();
  });
}

// a middleware that validates that attendance can be taken for this lesson
function validateAttendanceAllowed(req, res, next) {
  const lesson = req.lesson;
  const course = req.course;

  if (
    !canTakeAttendance(lesson.lesson_date, lesson.start_time, course.end_date)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Attendance can only be taken after lesson start time and before course end date",
    });
  }

  next();
}

// a middleware that validates that the logged in instructor owns
// the lesson
function validateInstructorOwnsLesson(req, res, next) {
  const lessonId = req.params.lesson_id;
  const instructorId = req.session.user.user_id;

  instructorQ.findInstructorLesson(lessonId, instructorId, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "This lesson does not belong to you",
      });
    }

    req.lesson = rows[0];
    req.course = rows[0];

    next();
  });
}

// a middleware that validates the attendance request body.
// the body marks a whole lesson at once:
//   { records: [ { user_id, attended: 'present' | 'absent' }, ... ] }
function validateAttendanceBody(req, res, next) {
  const { records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Attendance records are required",
    });
  }

  const seen = new Set();

  for (const record of records) {
    if (!record || !record.user_id) {
      return res.status(400).json({
        success: false,
        message: "Every attendance record needs a user id",
      });
    }

    if (!ATTENDANCE_VALUES.includes(record.attended)) {
      return res.status(400).json({
        success: false,
        message: "Attendance must be either present or absent",
      });
    }

    if (seen.has(record.user_id)) {
      return res.status(400).json({
        success: false,
        message: "The same user appears twice in the attendance",
      });
    }

    seen.add(record.user_id);
  }

  next();
}

// a middleware that validates that every user the instructor is marking is
// actually registered to the lesson's course
function validateUsersRegisteredToLessonCourse(req, res, next) {
  const courseId = req.course.course_id;
  const userIds = req.body.records.map((record) => record.user_id);

  instructorQ.findUnregisteredUsers(courseId, userIds, (err, missing) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        message: `These users are not registered to this course: ${missing.join(", ")}`,
      });
    }

    next();
  });
}

// a middleware that validates constraint details
function validateAddConstraint(req, res, next) {
  const sentFields = Object.keys(req.body);

  if (!areValidConstraintFields(sentFields)) {
    return res.status(400).json({
      success: false,
      message: "Invalid constraint fields",
    });
  }

  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "Start time and end time are required",
    });
  }

  const start = new Date(start_time.replace(" ", "T"));
  const end = new Date(end_time.replace(" ", "T"));

  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format",
    });
  }

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: "End time must be after start time",
    });
  }

  if (start < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Constraint must be in the future",
    });
  }

  next();
}

// a middleware that checks if there is a duplicate constraint of the instructor
function validateDuplicateConstraint(req, res, next) {
  const instructorId = req.session.user.user_id;
  const { start_time, end_time } = req.body;

  instructorQ.findDuplicateConstraint(
    instructorId,
    start_time,
    end_time,
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This constraint already exists",
        });
      }

      next();
    },
  );
}

// a middleware that checks if there is an overlapping constraint in the
// DB for the same instructor
function validateOverlappingConstraint(req, res, next) {
  const instructor_id = req.session.user.user_id;

  const { start_time, end_time } = req.body;

  instructorQ.findOverlappingConstraint(
    instructor_id,
    start_time,
    end_time,
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This constraint overlaps with an existing constraint",
        });
      }

      next();
    },
  );
}

module.exports = {
  validateInstructorOwnsCourse,
  validateAttendanceAllowed,
  validateInstructorOwnsLesson,
  validateAttendanceBody,
  validateUsersRegisteredToLessonCourse,
  validateAddConstraint,
  validateDuplicateConstraint,
  validateOverlappingConstraint,
};
