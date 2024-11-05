import express from 'express';
import { getDentalChart, updateDentalChart } from '../controllers/dentalChartController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Route: /api/dental-charts/:patientId
router.route('/:patientId')
  .get(authorize(['Dentist', 'Admin', 'Receptionist']), getDentalChart)
  .put(authorize(['Dentist', 'Admin']), updateDentalChart);

// Add debug logging
router.use((req, res, next) => {
  console.log('Dental Chart Route accessed:', {
    method: req.method,
    url: req.url,
    params: req.params,
    body: req.body
  });
  next();
});

export default router;
