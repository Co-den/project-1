const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Register
router.post("/register", authController.registerUser);

// Login
router.post("/login", authController.loginUser);

// Update your own profile
router.put("/updateUser/:id", auth.authenticateUser, authController.updateUser);

// Delete User
router.delete("/deleteUser/:id", auth.authenticateUser, authController.deleteUser);

module.exports = router;
