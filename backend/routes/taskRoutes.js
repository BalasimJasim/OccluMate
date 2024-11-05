import express from 'express';
import { createTask, getTasksByUser, getTodaysTasks } from '../controllers/taskController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// POST: Create a task
// All authenticated users can create tasks
router.post('/', createTask);

// GET: Get tasks by user
// Users can only view their own tasks, Admins can view all tasks
router.get('/user/:userId', authorize('Admin', 'Dentist', 'Receptionist'), getTasksByUser);

// GET: Get today's tasks
router.get('/today', getTodaysTasks);

export default router;
