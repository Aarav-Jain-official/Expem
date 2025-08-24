// models/Transaction.js (enhanced version)
import mongoose from 'mongoose';

const EARNINGS_CATEGORIES = ['salary', 'investment return','bonus','other'];
const EXPENSE_CATEGORIES = ['food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'other'];

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  category: {
    type: String,
    required: true,
    validate: {
      validator: function(category) {
        if (this.type === 'credit') {
          return EARNINGS_CATEGORIES.includes(category);
        } else if (this.type === 'debit') {
          return EXPENSE_CATEGORIES.includes(category);
        }
        return false;
      },
      message: 'Invalid category for the transaction type'
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ userId: 1, type: 1, category: 1 });
transactionSchema.index({ userId: 1, date: -1 });

// Static method to get earnings categories
transactionSchema.statics.getEarningsCategories = function() {
  return EARNINGS_CATEGORIES;
};

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
