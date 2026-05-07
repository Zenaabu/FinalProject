const { validateRole } = require("./utils");

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

module.exports = {
  validateRoleUpdate,
};
