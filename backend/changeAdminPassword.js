import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import colors from "colors";
import bcrypt from "bcryptjs";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const changeAdminPassword = async () => {
  try {
    // Connect to MongoDB
    console.log("\nConnecting to MongoDB...".yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB".green);

    // Get admin email
    const email = await new Promise((resolve) => {
      rl.question("Enter admin email: ".cyan, resolve);
    });

    // Find admin user
    const admin = await User.findOne({ email, role: "Admin" }).select(
      "+password"
    );

    if (!admin) {
      console.log("\nNo admin account found with this email!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Get current password
    const currentPassword = await new Promise((resolve) => {
      rl.question("Enter current password: ".cyan, resolve);
    });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      console.log("\nCurrent password is incorrect!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Get new password
    const newPassword = await new Promise((resolve) => {
      rl.question("Enter new password: ".cyan, resolve);
    });

    // Validate new password
    if (newPassword.length < 6) {
      console.log("\nPassword must be at least 6 characters long!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Confirm new password
    const confirmPassword = await new Promise((resolve) => {
      rl.question("Confirm new password: ".cyan, resolve);
    });

    if (newPassword !== confirmPassword) {
      console.log("\nPasswords do not match!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    console.log("\nPassword changed successfully!".green);
    console.log("\nYou can now log in with your new password.".cyan);

    await mongoose.disconnect();
    rl.close();
  } catch (error) {
    console.error("\nError changing password:".red, error.message);
    rl.close();
    process.exit(1);
  }
};

changeAdminPassword();
