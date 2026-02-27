const router = require("express").Router();
const User = require("./../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signup Route
router.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    // VALIDATE PASSWORD FIRST - before hashing!
    const passwordErrors = [];

    if (password.length < 6) {
      passwordErrors.push("Password must be at least 6 characters long");
    }

    if (!/[a-zA-Z]/.test(password)) {
      passwordErrors.push("Password must contain at least one letter");
    }

    if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?`~|]/.test(password)) {
      passwordErrors.push(
        "Password must contain at least one special character",
      );
    }

    if (passwordErrors.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Password validation failed",
        errors: passwordErrors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User with that email already exists",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      email,
      firstname,
      lastname,
      password: hashPass,
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Return user data without password
    const userData = {
      _id: newUser._id,
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      avatar: newUser.avatar,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    res.status(201).send({
      success: true,
      message: "User successfully created",
      token: token,
      user: userData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to sign up user",
      error: error.message,
    });
  }
});

// Login Route
router.post("/auth/login", async (req, res) => {
  try {
    //if email exists
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User doesn't exist",
      });
    }

    //if password is valid
    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) {
      return res.status(400).send({
        success: false,
        message: "Invalid password, please try again",
      });
    }

    // if password and email match, assign token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).send({
      success: true,
      message: "User successfully logged in",
      token: token,
      user: userData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Change Password Route
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

module.exports = router;
