import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import colors from "colors";

dotenv.config();

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("\nConnecting to MongoDB...".yellow);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB".green);

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "dentistelin@gmail.com" });

    if (adminExists) {
      console.log("\nAdmin account already exists!".red);
      console.log(
        "If you need to reset the admin account, first delete the existing one."
          .yellow
      );
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: "Dr. Balasim",
      email: "dentistelin@gmail.com",
      password: "123456",
      role: "Admin",
    });

    console.log("\nAdmin account created successfully!".green);
    console.log("\nLogin Credentials:".cyan);
    console.log("Email:".yellow, "dentistelin@gmail.com");
    console.log("Password:".yellow, "123456");
    console.log(
      "\nIMPORTANT: Please change these credentials immediately after first login!"
        .red
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("\nError creating admin account:".red, error.message);
    process.exit(1);
  }
};

createInitialAdmin();
