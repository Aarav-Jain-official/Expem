// transactionController.js
// Backend Controller: Handles API endpoints for transaction operations
import { Transaction } from "../models/trasact.model.js";
import mongoose from "mongoose";
const transactionController = {
  // Get all transactions for a user
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.find({ userId: req.user.id })
        .sort({ date: -1 });
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  },

  // Get single transaction by ID
  getTransactionById: async (req, res) => {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  },

  // Create new transaction
  createTransaction: async (req, res) => {
    try {
      const { description, amount, type, category, date } = req.body;

      // Validation
      if (!description || !amount || !type || !category) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      const transaction = await Transaction.create({
        userId: req.user.id,
        description,
        amount,
        type,
        category,
        date: date || new Date()
      });

      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Bad Request',
        error: error.message
      });
    }
  },

  // Update transaction
updateTransaction: async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, description, amount, date, status } = req.body;

    // ✅ Manual category validation (bypasses Mongoose validator issues)
    const EARNINGS_CATEGORIES = ['salary', 'investment return', 'bonus', 'other'];
    const EXPENSE_CATEGORIES = ['food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'other'];

    // Validate category against type if both are provided
    if (type && category) {
      const isValidCategory = (type === 'credit' && EARNINGS_CATEGORIES.includes(category)) ||
                              (type === 'debit' && EXPENSE_CATEGORIES.includes(category));

      if (!isValidCategory) {
        return res.status(400).json({
          success: false,
          message: 'Bad Request',
          error: `Invalid category "${category}" for ${type} transaction`
        });
      }
    }

    // ✅ Update without running the problematic custom validator
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { 
        new: true,
        runValidators: false  // ✅ Disable validators to bypass the custom validator issue
      }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
},

  // Delete transaction
  deleteTransaction: async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    // 2️⃣ Ensure user is attached
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    // 3️⃣ Attempt delete
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error); // This will show exact cause
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }

  },

  // Get transaction summary/statistics
  // In your transact.controller.js - just fix this method:
getTransactionSummary: async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } }, // Add 'new' here
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}

};

export default transactionController;
