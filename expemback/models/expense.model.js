import { Transaction } from './trasact.model.js';
import mongoose from 'mongoose';

class expenseModel {
  // Predefined categories for expenses
  static categories = ['food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'other'];

  // Get all expenses (debit transactions) for a user
  static async getExpensesByUserId(userId, filters = {}) {
    const query = {
      userId,
      type: 'debit',
      ...filters
    };

    return await Transaction.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email');
  }

  // Get expenses by category
  static async getExpensesByCategory(userId, category) {
    return await Transaction.find({
      userId,
      type: 'debit',
      category
    }).sort({ date: -1 });
  }

  // Get expenses within date range
  static async getExpensesByDateRange(userId, startDate, endDate) {
    return await Transaction.find({
      userId,
      type: 'debit',
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
  }

  // Get expense summary by category
  static async getExpenseSummaryByCategory(userId, startDate, endDate) {
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'debit'
    };

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    return await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
  }

  // Get total expenses for a user
  static async getTotalExpenses(userId, startDate, endDate) {
    const matchStage = {
      userId,
      type: 'debit'
    };

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { totalAmount: 0, transactionCount: 0 };
  }
}
export default expenseModel;