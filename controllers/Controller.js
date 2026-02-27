const router = require("express").Router();
const User = require("./../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.put("/auth/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user ID from token (you need to extract it from the authorization header)
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token and get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).send({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password against schema requirements
    const passwordErrors = [];

    if (newPassword.length < 6) {
      passwordErrors.push("Password must be at least 6 characters long");
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      passwordErrors.push("Password must contain at least one letter");
    }

    if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?`~|]/.test(newPassword)) {
      passwordErrors.push(
        "Password must contain at least one special character",
      );
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      passwordErrors.push(
        "New password must be different from current password",
      );
    }

    if (passwordErrors.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Password validation failed",
        errors: passwordErrors,
      });
    }

    // Hash the new password
    const hashPass = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashPass;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
});

// Delete Account Route
router.delete("/auth/delete-account", async (req, res) => {
  try {
    // Get user ID from token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token and get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
});

module.exports = router;
