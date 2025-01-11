import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import colors from "colors";
import readline from "readline";
import nodemailer from "nodemailer";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const generatePassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const sendCredentialsEmail = async (email, password, role) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OccluMate Account Credentials",
      text: `
Welcome to OccluMate!

Your account has been created with the following credentials:
Email: ${email}
Password: ${password}
Role: ${role}

Please change your password after your first login.

Best regards,
OccluMate Team
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("\nCredentials sent to staff email.".green);
  } catch (error) {
    console.error("\nError sending email:".red, error.message);
    console.log(
      "Please provide the credentials to the staff member manually.".yellow
    );
  }
};

const addStaffMember = async () => {
  try {
    // Connect to MongoDB
    console.log("\nConnecting to MongoDB...".yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB".green);

    // Get admin credentials
    const adminEmail = await new Promise((resolve) => {
      rl.question("Enter your admin email: ".cyan, resolve);
    });

    const adminPassword = await new Promise((resolve) => {
      rl.question("Enter your admin password: ".cyan, resolve);
    });

    // Verify admin
    const admin = await User.findOne({
      email: adminEmail,
      role: "Admin",
    }).select("+password");
    if (!admin || !(await admin.matchPassword(adminPassword))) {
      console.log("\nInvalid admin credentials!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Get staff details
    const name = await new Promise((resolve) => {
      rl.question("\nEnter staff member's name: ".cyan, resolve);
    });

    const email = await new Promise((resolve) => {
      rl.question("Enter staff member's email: ".cyan, resolve);
    });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("\nA user with this email already exists!".red);
      await mongoose.disconnect();
      rl.close();
      return;
    }

    console.log("\nSelect role:".cyan);
    console.log("1. Dentist");
    console.log("2. Receptionist");

    const roleChoice = await new Promise((resolve) => {
      rl.question("Enter choice (1 or 2): ".cyan, resolve);
    });

    const role = roleChoice === "1" ? "Dentist" : "Receptionist";
    const password = generatePassword();

    // Create staff member
    const staff = await User.create({
      name,
      email,
      password,
      role,
    });

    console.log("\nStaff member created successfully!".green);
    console.log("\nStaff Details:".cyan);
    console.log("Name:".yellow, staff.name);
    console.log("Email:".yellow, staff.email);
    console.log("Role:".yellow, staff.role);
    console.log("Temporary Password:".yellow, password);

    // Send credentials via email
    await sendCredentialsEmail(email, password, role);

    await mongoose.disconnect();
    rl.close();
  } catch (error) {
    console.error("\nError adding staff member:".red, error.message);
    rl.close();
    process.exit(1);
  }
};

addStaffMember();
