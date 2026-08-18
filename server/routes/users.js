const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const {
  checkUserExists,
  validateUpdateMyDetails,
} = require("../validations/usersValidations");
const {
  requireLogin,
  validateSignup,
} = require("../validations/authValidation");

const userQ = require("../queries/usersQueries");

// ensure the logged-in user can only access their own data
function requireSelf(req, res, next) {
  if (req.params.user_id !== req.session.user.user_id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

// POST signup
// url: /api/users/signup
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

  userQ.findUserById(user_id, async (err, rows) => {
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

      userQ.createUser(newUser, (err2) => {
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

// GET user by ID
// url: /api/users/:user_id
router.get(
  "/:user_id",
  requireLogin,
  requireSelf,
  checkUserExists,
  (req, res) => {
    const { user_id } = req.params;

    userQ.findUserById(user_id, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      const { password: _pw, ...safeUser } = rows[0];
      return res.json({ success: true, user: safeUser });
    });
  },
);

// PUT user by ID
// url: /api/users/:user_id
router.put(
  "/:user_id",
  requireLogin,
  requireSelf,
  validateUpdateMyDetails,
  async (req, res) => {
    const { user_id } = req.params;
    const { password } = req.body;
    // validateUpdateMyDetails already fetched the current user and merged
    // in whichever of first_name/last_name/email/phone/gender/birth_date
    // were sent, validating each one along the way
    const fields = req.updatedUser;

    // If email is changing, enforce uniqueness
    if (fields.email !== req.session.user.email) {
      const emailCheck = await new Promise((resolve) => {
        userQ.findUserByEmail(fields.email, (err, rows) => {
          if (err) return resolve({ err });
          resolve({ rows });
        });
      });

      if (emailCheck.err) {
        return res
          .status(500)
          .json({ success: false, message: emailCheck.err.message });
      }

      if (emailCheck.rows && emailCheck.rows.length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Email is already in use" });
      }
    }

    // Handle password change separately — already validated for strength
    // by validateUpdateMyDetails
    if (password) {
      try {
        const hashed = await bcrypt.hash(password, 10);
        await new Promise((resolve, reject) => {
          userQ.updateUserPassword(fields.email, hashed, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    userQ.updateMyDetails(user_id, fields, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      // update session email if it changed
      req.session.user.email = fields.email;

      return res.json({
        success: true,
        message: "Profile updated successfully",
      });
    });
  },
);

module.exports = router;
