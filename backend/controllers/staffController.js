import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generatePassword from "../utils/generatePassword.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all staff members (excluding admins)
// @route   GET /api/staff
// @access  Private/Admin
const getAllStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: { $in: ["Dentist", "Receptionist"] } })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json(staff);
});

// @desc    Add new staff member
// @route   POST /api/staff
// @access  Private/Admin
const addStaff = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate random password
  const password = generatePassword();

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    // Send email with credentials
    const emailContent = `
      Hello ${name},
      
      Your account has been created in the OccluMate system.
      Here are your login credentials:
      
      Email: ${email}
      Password: ${password}
      
      Please change your password after your first login.
      
      Best regards,
      OccluMate Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to OccluMate - Your Account Credentials",
        message: emailContent,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't throw error here, just log it
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if email is being changed and if it's already taken
  if (email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  // Prevent changing admin users
  if (user.role === "Admin") {
    res.status(400);
    throw new Error("Admin users cannot be modified through this endpoint");
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent deleting admin users
  if (user.role === "Admin") {
    res.status(400);
    throw new Error("Admin users cannot be deleted through this endpoint");
  }

  await user.deleteOne();
  res.json({ message: "User removed" });
});

export { getAllStaff, addStaff, updateStaff, deleteStaff };
