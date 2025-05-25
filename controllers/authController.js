const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
exports.registerUser = async (req, res) => {
  // Check if the request body contains all required fields
  const { name, email, password } = req.body;
  // Validate input
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  // Check password strength
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });
  // Save user to database
  await newUser.save();
  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    },
  });
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  // Validate input
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  // Set token in cookie
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    // no need to check req.params.id vs req.user.id
    const { name, email, password } = req.body;
    const updatedData = { name, email };
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }
    // Check if the user is trying to update their own profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // use the authenticated user’s ID
      updatedData,
      { new: true }
    );

    // Check if user was found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return the updated user data
    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
