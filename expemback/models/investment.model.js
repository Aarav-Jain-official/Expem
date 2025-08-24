// models/Investment.js
import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentType: {
    type: String,
    enum: [
      'stocks', 'bonds', 'mutual_funds', 'etf', 'cryptocurrency', 
      'real_estate', 'commodities', 'fixed_deposit', 'recurring_deposit',
      'ppe', 'startup', 'p2p_lending', 'other'
    ],
    required: true
  },
  instrumentName: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    uppercase: true,
    trim: true
  },
  principalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  maturityDate: {
    type: Date
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  expectedReturn: {
    type: Number, // Annual expected return percentage
    min: 0,
    max: 100
  },
  actualReturn: {
    type: Number,
    default: 0
  },
  dividendFrequency: {
    type: String,
    enum: ['none', 'monthly', 'quarterly', 'semi_annual', 'annual'],
    default: 'none'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Performance tracking
  performanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: Number,
    return: Number,
    returnPercentage: Number
  }],
  // Goal tracking
  targetAmount: {
    type: Number,
    min: 0
  },
  targetDate: {
    type: Date
  },
  goalAchieved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
investmentSchema.index({ userId: 1, investmentType: 1 });
investmentSchema.index({ userId: 1, isActive: 1 });
investmentSchema.index({ userId: 1, purchaseDate: -1 });
investmentSchema.index({ symbol: 1 });

// Virtual for current ROI
investmentSchema.virtual('currentROI').get(function() {
  if (this.principalAmount === 0) return 0;
  return ((this.currentValue - this.principalAmount) / this.principalAmount) * 100;
});

// Virtual for annualized return
investmentSchema.virtual('annualizedReturn').get(function() {
  const daysDiff = Math.abs(new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24);
  const years = daysDiff / 365;
  if (years === 0) return 0;
  
  const totalReturn = (this.currentValue / this.principalAmount);
  return (Math.pow(totalReturn, 1/years) - 1) * 100;
});

// Virtual for days invested
investmentSchema.virtual('daysInvested').get(function() {
  return Math.floor((new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24));
});

// Virtual for profit/loss
investmentSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.principalAmount;
});

// Instance method to update performance
investmentSchema.methods.updatePerformance = function(newValue, newPrice = null) {
  this.currentValue = newValue;
  if (newPrice) this.currentPrice = newPrice;
  
  const returnAmount = newValue - this.principalAmount;
  const returnPercentage = (returnAmount / this.principalAmount) * 100;
  
  this.performanceHistory.push({
    date: new Date(),
    value: newValue,
    return: returnAmount,
    returnPercentage: returnPercentage
  });
  
  this.actualReturn = returnPercentage;
  return this.save();
};

// Static method to get portfolio summary
investmentSchema.statics.getPortfolioSummary = async function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalInvestments: { $sum: 1 },
        totalPrincipal: { $sum: '$principalAmount' },
        totalCurrentValue: { $sum: '$currentValue' },
        avgExpectedReturn: { $avg: '$expectedReturn' },
        totalProfitLoss: { $sum: { $subtract: ['$currentValue', '$principalAmount'] } }
      }
    },
    {
      $addFields: {
        totalROI: {
          $cond: {
            if: { $eq: ['$totalPrincipal', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$totalProfitLoss', '$totalPrincipal'] }, 100] }
          }
        }
      }
    }
  ]);
};

export const Investment = mongoose.model('Investment', investmentSchema);
