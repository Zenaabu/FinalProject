const userQ = require("../queries/usersQueries");
const courseQ = require("../queries/courseQueries");

const {
  validateName,
  validateEmail,
  validatePhone,
  validateGender,
  validateBirthDate,
  areValidUserUpdateFields,
  buildUpdatedUser,
} = require("./utils");

// a middleware that checks if the user exists
function checkUserExists(req, res, next) {
  const { user_id } = req.params;

  userQ.findUserById(user_id, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  });
}

// a middleware that validates the updated data details
function validateUpdateMyDetails(req, res, next) {
  const sentFields = Object.keys(req.body);

  if (sentFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required",
    });
  }

  if (!areValidUserUpdateFields(sentFields)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user fields",
    });
  }

  const user_id = req.session.user.user_id;

  userQ.findUserById(user_id, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = buildUpdatedUser(rows[0], req.body);

    if (!validateName(updatedUser.first_name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid first name" });
    }

    if (!validateName(updatedUser.last_name)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid last name" });
    }

    if (!validateEmail(updatedUser.email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!validatePhone(updatedUser.phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number" });
    }

    if (!validateGender(updatedUser.gender)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid gender" });
    }

    if (!validateBirthDate(updatedUser.birth_date)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid birth date" });
    }

    req.updatedUser = updatedUser;
    next();
  });
}

// a middleware that validates the creation of the paypal order
function validateCanCreatePayPalOrder(req, res, next) {
  const { course_id } = req.params;
  const user_id = req.session.user.user_id;

  // release seats held by reservations whose 10 minute window has passed,
  // otherwise a course can look full because of abandoned checkouts
  courseQ.expireOldReservations((err0) => {
    if (err0) {
      return res.status(500).json({
        success: false,
        message: err0.message,
      });
    }

    courseQ.findCourseById(course_id, (err, courseRows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!courseRows || courseRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const course = courseRows[0];

      if (Number(course.is_active) !== 1) {
        return res.status(400).json({
          success: false,
          message: "Course is not active",
        });
      }

      userQ.isUserRegistered(user_id, course_id, (err2, regRows) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        if (regRows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "You are already registered to this course",
          });
        }

        userQ.getCourseTakenPlaces(course_id, (err3, placeRows) => {
          if (err3) {
            return res.status(500).json({
              success: false,
              message: err3.message,
            });
          }

          const places = placeRows[0];

          const taken =
            Number(places.registered_count) + Number(places.pending_count);

          if (taken >= Number(places.capacity)) {
            return res.status(409).json({
              success: false,
              message: "Course is full",
            });
          }

          req.course = course;
          next();
        });
      });
    });
  });
}

module.exports = {
  checkUserExists,
  validateUpdateMyDetails,
  validateCanCreatePayPalOrder,
};
