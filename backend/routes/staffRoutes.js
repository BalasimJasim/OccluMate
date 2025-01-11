import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

const router = express.Router();

// All routes require authentication and admin authorization
router.use(protect);
router.use(authorize(["Admin"]));

router.route("/").get(getAllStaff).post(addStaff);

router.route("/:id").put(updateStaff).delete(deleteStaff);

export default router;
