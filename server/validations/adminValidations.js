const { validateRole, validateBlockedStatusValue } = require("./utils");

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

module.exports = {
  validateRoleUpdate,
  validateBlockedStatus,
};
