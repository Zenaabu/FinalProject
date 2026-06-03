const express = require("express");
const router = express.Router();

const { validateUpdateMyDetails } = require("../validations/usersValidations");
const { requireLogin } = require("../validations/authValidation");

const userQ = require("../queries/usersQueries");

// PUT user details
// url: /api/user/me
router.put("/me", requireLogin, validateUpdateMyDetails, (req, res) => {
  const user_id = req.session.user.user_id;

  userQ.updateMyDetails(user_id, req.updatedUser, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  });
});

module.exports = router;
