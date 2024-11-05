import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDentists } from '../controllers/userController.js';

const router = express.Router();

// Protected route to get all dentists
router.get('/dentists', protect, getDentists);

export default router;
