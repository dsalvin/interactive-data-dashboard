import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateDashboardConfig,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/dashboard-config', protect, updateDashboardConfig);

export default router;