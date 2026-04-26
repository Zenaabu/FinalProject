const { validateID, validatePassword } = require("./utils");

// a function that validates the login request body, checking if the user_id and password are present and valid
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
