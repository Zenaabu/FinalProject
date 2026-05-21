const userQ = require("../queries/usersQueries");

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

module.exports = {
  checkUserExists,
};
