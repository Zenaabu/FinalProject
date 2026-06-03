const userQ = require("../queries/usersQueries");
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

module.exports = {
  checkUserExists,
  validateUpdateMyDetails,
};
