import express from 'express';
import { 
  login, 
  register, 
  patientLogin 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/patient-login', patientLogin);

export default router;
