import express from 'express';
import { createPrescription, getPrescriptionsByPatient } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// POST: Create a prescription
// Only Dentists and Admins can create prescriptions
router.post('/', authorize('Dentist', 'Admin'), createPrescription);

// GET: Get patient's prescriptions
// Dentists, Admins, and Receptionists can view prescriptions
router.get('/patient/:patientId', authorize('Dentist', 'Admin', 'Receptionist'), getPrescriptionsByPatient);

export default router;
