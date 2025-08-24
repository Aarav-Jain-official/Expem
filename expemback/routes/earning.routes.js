// routes/earningsRoutes.js
import express from 'express';
import { earningsController } from '../controllers/earning.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Get all earnings
router.get('/', earningsController.getAllEarnings);

// Get earnings summary with category breakdown
router.get('/summary', earningsController.getEarningsSummary);

// Get earnings by date range
router.get('/date-range', earningsController.getEarningsByDateRange);

// Get earnings by specific category
router.get('/category/:category', earningsController.getEarningsByCategory);

// Create new earning
router.post('/', earningsController.createEarning);

export default router;
