import expenseModel from '../models/expense.model.js';
import { Transaction } from '../models/trasact.model.js';
import mongoose from 'mongoose';

const expenseController = {
  // Get all expenses for authenticated user
  async getAllExpenses(req, res) {
    try {
      const userId = req.user.id;
      const { 
        category, 
        startDate, 
        endDate, 
        status,
        page = 1, 
        limit = 10 
      } = req.query;

      // Build filter object
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get expenses with filters
      const expenses = await Transaction.find({
        userId,
        type: 'debit',
        ...filters
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

      // Get total count for pagination
      const totalExpenses = await Transaction.countDocuments({
        userId,
        type: 'debit',
        ...filters
      });

      res.status(200).json({
        success: true,
        data: {
          expenses,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalExpenses / limit),
            totalExpenses,
            hasNext: page * limit < totalExpenses,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses',
        error: error.message
      });
    }
  },

  // Get expenses by category
  async getExpensesByCategory(req, res) {
    try {
      const userId = req.user.id;
      const { category } = req.params;

      // Validate category
      if (!expenseModel.categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      const expenses = await expenseModel.getExpensesByCategory(userId, category);

      res.status(200).json({
        success: true,
        data: {
          category,
          expenses,
          totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
          count: expenses.length
        }
      });
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses by category',
        error: error.message
      });
    }
  },

  // Get expense summary by categories
  async getExpenseSummary(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      // Get category-wise summary
      const categorySummary = await expenseModel.getExpenseSummaryByCategory(
        userId, 
        startDate, 
        endDate
      );

      // Get total expenses
      const totalSummary = await expenseModel.getTotalExpenses(
        userId, 
        startDate, 
        endDate
      );

      // Get recent expenses
      const recentExpenses = await Transaction.find({
        userId,
        type: 'debit'
      })
      .sort({ date: -1 })
      .limit(5);

      res.status(200).json({
        success: true,
        data: {
          categorySummary,
          totalSummary,
          recentExpenses,
          availableCategories: expenseModel.categories
        }
      });
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense summary',
        error: error.message
      });
    }
  },

  // Create new expense
  async createExpense(req, res) {
    try {
      const userId = req.user.id;
      const { description, amount, category, date, status = 'completed' } = req.body;

      // Validate required fields
      if (!description || !amount || !category) {
        return res.status(400).json({
          success: false,
          message: 'Description, amount, and category are required'
        });
      }

      // Validate category
      if (!expenseModel.categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      // Validate amount
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      const expenseData = {
        userId,
        description: description.trim(),
        amount: Math.abs(amount), // Ensure positive amount for expenses
        type: 'debit',
        category,
        status,
        date: date ? new Date(date) : new Date()
      };

      const expense = new Transaction(expenseData);
      await expense.save();

      await expense.populate('userId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create expense',
        error: error.message
      });
    }
  },

  // Update expense
  async updateExpense(req, res) {
    try {
      const userId = req.user.id;
      const { expenseId } = req.params;
      const updates = req.body;

      // Validate expense ID
      if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expense ID'
        });
      }

      // Find expense
      const expense = await Transaction.findOne({
        _id: expenseId,
        userId,
        type: 'debit'
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Validate category if provided
      if (updates.category && !expenseModel.categories.includes(updates.category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      // Validate amount if provided
      if (updates.amount !== undefined && updates.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['description', 'amount', 'category', 'date', 'status'];
      const updateData = {};
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'description') {
            updateData[field] = updates[field].trim();
          } else if (field === 'amount') {
            updateData[field] = Math.abs(updates[field]);
          } else if (field === 'date') {
            updateData[field] = new Date(updates[field]);
          } else {
            updateData[field] = updates[field];
          }
        }
      });

      const updatedExpense = await Transaction.findByIdAndUpdate(
        expenseId,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email');

      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: updatedExpense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update expense',
        error: error.message
      });
    }
  },

  // Delete expense
  async deleteExpense(req, res) {
    try {
      const userId = req.user.id;
      const { expenseId } = req.params;

      // Validate expense ID
      if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expense ID'
        });
      }

      // Find and delete expense
      const expense = await Transaction.findOneAndDelete({
        _id: expenseId,
        userId,
        type: 'debit'
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete expense',
        error: error.message
      });
    }
  },

  // Get available categories
  async getCategories(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          categories: expenseModel.categories
        }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }
};

export default expenseController