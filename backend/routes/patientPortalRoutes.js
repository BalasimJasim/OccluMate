import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  getDashboardData,
  getPatientAppointments,
  bookAppointment,
  getPatientDentalChart,
  getPatientMedicalHistory,
  getPatientSettings,
  updatePatientSettings,
  getPatientPrescriptions
} from '../controllers/patientPortalController.js';

const router = express.Router();

// Protect all routes and ensure user is a patient
router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ message: 'Access denied. Patients only.' });
  }
  next();
});

// Dashboard
router.get('/dashboard', getDashboardData);

// Appointments
router.get('/appointments', getPatientAppointments);
router.post('/appointments', bookAppointment);

// Prescriptions
router.get('/prescriptions', getPatientPrescriptions);

// Dental Chart
router.get('/dental-chart', getPatientDentalChart);

// Medical History
router.get('/medical-history', getPatientMedicalHistory);

// Settings
router.get('/settings', getPatientSettings);
router.put('/settings', updatePatientSettings);

export default router;
