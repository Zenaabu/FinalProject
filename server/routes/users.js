// importing all the relevant libraries and middlewares for validation and queries
const express = require("express");
const router = express.Router();

// POST login (id + password)
// url: /api/users/login
router.post("/login", validateLogin, (req, res) => {
  const { user_id, password } = req.body;

  usersQ.findUserByIdAndPassword(user_id, password, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    // user not found
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid id or password",
      });
    }

    const user = rows[0];

    // blocked user
    if (user.is_blocked === 1) {
      return res.status(403).json({
        success: false,
        message: "User is blocked",
      });
    }

    // save the user in the session
    req.session.user = {
      user_id: user.user_id,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };

    return res.status(200).json({
      success: true,
      message: "Login success",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  });
});
