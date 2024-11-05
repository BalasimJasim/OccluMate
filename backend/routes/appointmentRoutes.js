// routes/appointmentRoutes.js

import express from 'express';
import {
  bookAppointment,
  checkDentistAvailability,
  cancelAppointment,
  getPatientAppointments,
  getPatientAppointmentHistory,
  getUpcomingAppointments,
  getAllAppointments,
  addAppointment,
  deleteAppointment,
  updateAppointment,
  getAppointmentById,
  getTodayAppointments
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Define allowed roles
const STAFF_ROLES = ['Admin', 'Dentist', 'Receptionist'];

// Update the delete route to allow all staff roles
router.delete('/:id', checkRole(STAFF_ROLES), deleteAppointment);

// Update other routes that need role-based access
router.post('/', checkRole(STAFF_ROLES), addAppointment);
router.put('/:id', checkRole(STAFF_ROLES), updateAppointment);

// Book/Add appointment (both POST endpoints)
router.post('/', addAppointment);  // For general appointment creation
router.post('/book', bookAppointment);  // For patient portal booking

// Get appointments
router.get('/', getAllAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/check-availability', checkDentistAvailability);
router.get('/patient/me', getPatientAppointments);
router.get('/patient/me/history', getPatientAppointmentHistory);

// Update/Cancel appointment
router.put('/:id/cancel', cancelAppointment);


router.get('/today', getTodayAppointments);

// Update the routes order (put this before the /:id GET route)
router.put('/:id', updateAppointment);  // Add this line
router.get('/:id', getAppointmentById);

export default router;
