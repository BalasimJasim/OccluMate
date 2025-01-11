import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.create({
      name: "Balasim",
      email: "balasimboliewi@gmail.com",
      password: "123456",
      role: "Receptionist",
    });

    console.log("User created:", user);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

createUser();
