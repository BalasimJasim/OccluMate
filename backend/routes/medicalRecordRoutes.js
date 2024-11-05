import express from 'express';
import { getMedicalRecord, updateMedicalRecord } from '../controllers/medicalRecordController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes with explicit role arrays
router.get('/:patientId', authorize(['Dentist', 'Admin', 'Receptionist']), getMedicalRecord);
router.put('/:patientId', authorize(['Dentist', 'Admin']), updateMedicalRecord);

export default router;
