import express from 'express';
import {
  login,
  register,
  patientLogin,
  verify,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/patient-login", patientLogin);
router.get("/verify", verify);

export default router;
