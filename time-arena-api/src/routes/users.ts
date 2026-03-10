import express from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Protect all user routes
router.use(protect);

// Get analytics data for the authenticated user
router.get('/me/analytics', userController.getAnalytics);

// Get profile information for the authenticated user
router.get('/me', userController.getMe);

export default router;
