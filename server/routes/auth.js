// importing all the relevant libraries and middlewares for validation and queries
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // to hash the passwords
const usersQ = require("../queries/usersQueries");

const {
  validateLogin,
  validateEmailFormat,
  validateSignup,
} = require("../validations/authValidation");
const { sendResetCode } = require("../validations/utils");

// POST login (id + password)
// url: /api/auth/login
router.post("/login", validateLogin, (req, res) => {
  const { user_id, password } = req.body;

  usersQ.findUserById(user_id, (err, rows) => {
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

    // compare plain password with hashed password from DB
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid id or password",
        });
      }

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
        // TODO: we have to delete this at the end
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
});

// POST forget-password (email)
// url: /api/auth/forget-password
router.post("/forget-password", validateEmailFormat, (req, res) => {
  const { email } = req.body;

  usersQ.findUserByEmail(email, async (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist",
      });
    }

    const user = rows[0];

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEV] OTP for ${user.email}: ${code}`);
    const hashedCode = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    usersQ.upsertResetCode(
      user.user_id,
      user.email,
      hashedCode,
      expiresAt,
      async (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        await sendResetCode(user.email, code);

        res.json({
          success: true,
          message: "Reset code sent",
        });
      },
    );
  });
});

// POST verify-otp (email + OTP code)
// url: /api/auth/verify-otp
router.post("/verify-otp", validateEmailFormat, async (req, res) => {
  const { email, code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "OTP code is required" });
  }

  usersQ.findResetCodeByEmail(email, async (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP code has expired or does not exist",
      });
    }

    const isMatch = await bcrypt.compare(code, rows[0].code);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code" });
    }

    return res.json({ success: true, message: "OTP verified" });
  });
});

// POST reset-password (email + new password)
// url: /api/auth/reset-password
router.post("/reset-password", validateEmailFormat, async (req, res) => {
  const { email, newPassword } = req.body;

  if (!newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "New password is required" });
  }

  usersQ.findResetCodeByEmail(email, async (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please start the password reset again.",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      usersQ.updateUserPassword(email, hashedPassword, (err2) => {
        if (err2) {
          return res
            .status(500)
            .json({ success: false, message: err2.message });
        }

        usersQ.deleteResetCodeByEmail(email, (err3) => {
          if (err3) {
            console.error("Failed to delete reset code:", err3.message);
          }
        });

        return res.json({
          success: true,
          message: "Password updated successfully",
        });
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

// POST signup
// url: /api/auth/signup
router.post("/signup", validateSignup, (req, res) => {
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

  usersQ.findUserById(user_id, async (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    // the user already exists
    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = {
        user_id,
        first_name,
        last_name,
        email,
        phone,
        gender,
        birth_date,
        role: "user", // when signup by default the role is user
        password: hashedPassword,
        is_blocked: 0, // by default the user is not blocked (false=0)
      };

      usersQ.createUser(newUser, (err2) => {
        if (err2) {
          return res.status(500).json({
            success: false,
            message: err2.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Signup success",
        });
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
});

module.exports = router;
