// controllers/earningsController.js
import { Transaction } from "../models/trasact.model.js";

const EARNINGS_CATEGORIES = ['salary', 'investment return','other'];

export const earningsController = {
  // Get all earnings (credit transactions) for a user
  getAllEarnings: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const earnings = await Transaction.find({
        userId,
        type: 'credit',
        category: { $in: EARNINGS_CATEGORIES }
      })
      .sort({ date: -1 })
      .populate('userId', 'name email');

      const totalEarnings = earnings.reduce((sum, transaction) => sum + transaction.amount, 0);

      res.status(200).json({
        success: true,
        data: {
          earnings,
          totalEarnings,
          count: earnings.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching earnings',
        error: error.message
      });
    }
  },

  // Get earnings by specific category
  getEarningsByCategory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { category } = req.params;

      if (!EARNINGS_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories: ${EARNINGS_CATEGORIES.join(', ')}`
        });
      }

      const earnings = await Transaction.find({
        userId,
        type: 'credit',
        category
      })
      .sort({ date: -1 })
      .populate('userId', 'name email');

      const totalEarnings = earnings.reduce((sum, transaction) => sum + transaction.amount, 0);

      res.status(200).json({
        success: true,
        data: {
          earnings,
          totalEarnings,
          count: earnings.length,
          category
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching earnings by category',
        error: error.message
      });
    }
  },

  // Get earnings summary with category breakdown
  getEarningsSummary: async (req, res) => {
    try {
      const userId = req.user.id;

      const earningsSummary = await Transaction.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            type: 'credit',
            category: { $in: EARNINGS_CATEGORIES }
          }
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        },
        {
          $sort: { totalAmount: -1 }
        }
      ]);

      const totalEarnings = earningsSummary.reduce((sum, item) => sum + item.totalAmount, 0);

      res.status(200).json({
        success: true,
        data: {
          summary: earningsSummary,
          totalEarnings,
          categories: EARNINGS_CATEGORIES
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching earnings summary',
        error: error.message
      });
    }
  },

  // Get earnings within date range
  getEarningsByDateRange: async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const earnings = await Transaction.find({
        userId,
        type: 'credit',
        category: { $in: EARNINGS_CATEGORIES },
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .sort({ date: -1 })
      .populate('userId', 'name email');

      const totalEarnings = earnings.reduce((sum, transaction) => sum + transaction.amount, 0);

      res.status(200).json({
        success: true,
        data: {
          earnings,
          totalEarnings,
          count: earnings.length,
          dateRange: { startDate, endDate }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching earnings by date range',
        error: error.message
      });
    }
  },

  // Create new earning entry
  createEarning: async (req, res) => {
    try {
      const userId = req.user.id;
      const { description, amount, category, date } = req.body;

      if (!EARNINGS_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories: ${EARNINGS_CATEGORIES.join(', ')}`
        });
      }

      const newEarning = new Transaction({
        userId,
        description,
        amount,
        type: 'credit',
        category,
        date: date || new Date(),
        status: 'completed'
      });

      await newEarning.save();
      await newEarning.populate('userId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Earning created successfully',
        data: newEarning
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating earning',
        error: error.message
      });
    }
  }
};
