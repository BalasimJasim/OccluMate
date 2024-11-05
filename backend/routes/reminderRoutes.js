import express from 'express';
import {
  createReminder,
  getPendingReminders,
  updateReminderStatus,
  getPatientReminders,
  deleteReminder,
  createAppointmentReminders
} from '../controllers/reminderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes that require staff authorization
router.use(authorize(['Admin', 'Dentist', 'Receptionist']));

// GET: Get all pending reminders
router.get('/pending', getPendingReminders);

// POST: Create a new reminder
router.post('/', createReminder);

// POST: Bulk create reminders for an appointment
router.post('/appointment', createAppointmentReminders);

// GET: Get reminders for a specific patient
router.get('/patient/:patientId', getPatientReminders);

// PUT: Update reminder status
router.put('/:id/status', updateReminderStatus);

// DELETE: Delete a reminder
router.delete('/:id', deleteReminder);

export default router; 