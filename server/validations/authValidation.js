const {
  validateId,
  validatePassword,
  validateEmail,
  validatePhone,
  validateGender,
  validateBirthDate,
  validateName,
} = require("./utils");

// a middleware that validates the login request body, checking if the user_id and password are present and valid
function validateLogin(req, res, next) {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({
      success: false,
      message: "must enter id number and password to login!",
    });
  }

  // check if id is valid
  if (!validateId(user_id)) {
    return res.status(400).json({
      success: false,
      message: "Id is not valid!",
    });
  }

  // check if password is valid
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password is not valid!",
    });
  }
  next();
}

// a middleware that validates the email that we got through request body
function validateEmailFormat(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  next();
}

// a middleware that checks that all signup data are valid
function validateSignup(req, res, next) {
  const {
    user_id,
    first_name,
    last_name,
    email,
    phone,
    gender,
    birth_date,
    password,
  } = req.body;

  // all fields are required
  if (
    !user_id ||
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !gender ||
    !birth_date ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }

  // check if id is valid
  if (!validateId(user_id)) {
    return res.status(400).json({
      success: false,
      message: "Id is not valid!",
    });
  }

  // check if name and last name is valid
  if (!validateName(first_name) || !validateName(last_name)) {
    return res.status(400).json({
      success: false,
      message: "Name must contain letters only (English)",
    });
  }

  // check if email is valid
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email is not valid!",
    });
  }

  // check if phone is valid
  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number is not valid!",
    });
  }

  // check if gender is valid
  if (!validateGender(gender)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Gender value!",
    });
  }

  // check if birth date is valid
  if (!validateBirthDate(birth_date)) {
    return res.status(400).json({
      success: false,
      message: "User must be at least 18 years old!",
    });
  }

  // check if password is valid
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password is not valid!",
    });
  }

  next();
}

// a middleware that checks if the user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must login first!",
    });
  }

  next();
}

// a middleware that checks if the logged in user is an admin
function requireAdmin(req, res, next) {
  if (req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only!",
    });
  }

  next();
}

module.exports = {
  validateLogin,
  validateEmailFormat,
  validateSignup,
  requireLogin,
  requireAdmin,
};
