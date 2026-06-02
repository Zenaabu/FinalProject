const instructorQ = require("../queries/instructorQueries");

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

module.exports = {
  validateInstructorOwnsCourse,
};
