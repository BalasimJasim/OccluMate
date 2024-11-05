import express from 'express';
import {
  addPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Add debug middleware
router.use((req, res, next) => {
  console.log('Patient Route accessed:', {
    method: req.method,
    url: req.url,
    params: req.params,
    user: req.user?._id
  });
  next();
});

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAllPatients)
  .post(addPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

export default router;
