// routes/investmentRoutes.js
import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js'; 
import {
  getAllInvestments,
  createInvestment,
  getPerformanceAnalytics,
  getGoalProgress,
  getDividendHistory,
  getRecommendations,
  updatePerformance
} from '../controllers/investment.controller.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Investment management routes
router.get('/', getAllInvestments);
router.post('/', createInvestment);
router.put('/:id/performance', updatePerformance);

// Analytics and reporting routes
router.get('/analytics', getPerformanceAnalytics);
router.get('/goals', getGoalProgress);
router.get('/dividends', getDividendHistory);
router.get('/recommendations', getRecommendations);

export default router;
