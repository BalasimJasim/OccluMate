// routes/analyticsRoutes.js

import express from 'express';
import { getAppointmentStats, getTreatmentStats, getTaskStats } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Only Admins can access analytics
router.use(authorize('Admin'));

// GET: Appointment statistics
router.get('/appointments', getAppointmentStats);

// GET: Treatment statistics
router.get('/treatments', getTreatmentStats);

// GET: Task statistics for staff
router.get('/tasks', getTaskStats);

export default router;
