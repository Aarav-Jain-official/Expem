// controllers/investmentController.js
import { Investment } from '../models/investment.model.js';
import { Transaction } from "../models/trasact.model.js";
import mongoose from 'mongoose';


// Get all investments with portfolio summary
export const getAllInvestments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, active = 'true', sortBy = 'purchaseDate', order = 'desc' } = req.query;

    console.log('Fetching investments for user:', userId);

    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    if (type) filter.investmentType = type;
    if (active !== 'all') filter.isActive = active === 'true';

    const investments = await Investment.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .lean();

    console.log('Found investments:', investments.length);

    // Calculate portfolio summary
    const totalInvestments = investments.length;
    const totalPrincipal = investments.reduce((sum, inv) => sum + (inv.principalAmount || 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.principalAmount || 0), 0);
    const totalROI = totalPrincipal > 0 ? ((totalCurrentValue - totalPrincipal) / totalPrincipal) * 100 : 0;

    const portfolioSummary = {
      totalInvestments,
      totalPrincipal,
      totalCurrentValue,
      totalROI,
      totalProfitLoss: totalCurrentValue - totalPrincipal
    };

    res.status(200).json({
      success: true,
      data: {
        investments,
        portfolioSummary,
        count: investments.length
      }
    });
  } catch (error) {
    console.error('Error in getAllInvestments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investments',
      error: error.message
    });
  }
};

// Create new investment
export const createInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const investmentData = {
      ...req.body,
      userId: new mongoose.Types.ObjectId(userId),
      currentValue: req.body.currentValue || req.body.principalAmount
    };

    console.log('Creating investment with data:', investmentData);

    const investment = new Investment(investmentData);
    await investment.save();

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });
  } catch (error) {
    console.error('Error in createInvestment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating investment',
      error: error.message
    });
  }
};

// Get performance analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching analytics for user:', userId);

    const investments = await Investment.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      isActive: true 
    }).lean();

    if (!investments || investments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          performanceByType: [],
          riskDistribution: []
        }
      });
    }

    // Group by investment type manually
    const typeGroups = {};
    const riskGroups = {};

    investments.forEach(investment => {
      const type = investment.investmentType || 'other';
      const risk = investment.riskLevel || 'medium';
      const principal = investment.principalAmount || 0;
      const currentValue = investment.currentValue || investment.principalAmount || 0;
      const roi = principal > 0 ? ((currentValue - principal) / principal) * 100 : 0;

      // Group by type
      if (!typeGroups[type]) {
        typeGroups[type] = {
          _id: type,
          count: 0,
          totalPrincipal: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          roiSum: 0
        };
      }

      typeGroups[type].count += 1;
      typeGroups[type].totalPrincipal += principal;
      typeGroups[type].totalCurrentValue += currentValue;
      typeGroups[type].totalProfitLoss += (currentValue - principal);
      typeGroups[type].roiSum += roi;

      // Group by risk
      if (!riskGroups[risk]) {
        riskGroups[risk] = {
          _id: risk,
          count: 0,
          totalAmount: 0,
          expectedReturnSum: 0
        };
      }

      riskGroups[risk].count += 1;
      riskGroups[risk].totalAmount += principal;
      riskGroups[risk].expectedReturnSum += (investment.expectedReturn || 0);
    });

    // Convert to arrays and calculate averages
    const performanceByType = Object.values(typeGroups).map(group => ({
      ...group,
      avgROI: group.count > 0 ? group.roiSum / group.count : 0,
      bestPerformer: group.roiSum / group.count,
      worstPerformer: group.roiSum / group.count
    }));

    const riskDistribution = Object.values(riskGroups).map(group => ({
      ...group,
      avgExpectedReturn: group.count > 0 ? group.expectedReturnSum / group.count : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        performanceByType,
        riskDistribution
      }
    });
  } catch (error) {
    console.error('Error in getPerformanceAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance analytics',
      error: error.message
    });
  }
};

// Get investment returns from transaction data
export const getDividendHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { investmentId, year } = req.query;

    console.log('Fetching dividend history for user:', userId);

    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId),
      type: 'credit',
      category: 'investment return'
    };

    if (investmentId) {
      matchStage.description = { $regex: investmentId, $options: 'i' };
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const dividends = await Transaction.find(matchStage)
      .sort({ date: -1 })
      .lean();

    console.log('Found dividends:', dividends.length);

    // Calculate summary
    const summary = {
      totalDividends: dividends.reduce((sum, div) => sum + (div.amount || 0), 0),
      count: dividends.length,
      avgDividend: dividends.length > 0 ? dividends.reduce((sum, div) => sum + (div.amount || 0), 0) / dividends.length : 0,
      maxDividend: dividends.length > 0 ? Math.max(...dividends.map(div => div.amount || 0)) : 0,
      minDividend: dividends.length > 0 ? Math.min(...dividends.map(div => div.amount || 0)) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        dividends,
        summary
      }
    });
  } catch (error) {
    console.error('Error in getDividendHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dividend history',
      error: error.message
    });
  }
};

// Get goal progress
export const getGoalProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching goals for user:', userId);

    const goals = await Investment.find({
      userId: new mongoose.Types.ObjectId(userId),
      targetAmount: { $exists: true, $gt: 0 },
      isActive: true
    }).select('instrumentName targetAmount currentValue targetDate goalAchieved').lean();

    console.log('Found goals:', goals.length);

    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: goal.targetAmount > 0 ? (goal.currentValue / goal.targetAmount) * 100 : 0,
      remaining: Math.max(goal.targetAmount - goal.currentValue, 0),
      daysToTarget: goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    const summary = {
      totalGoals: goals.length,
      achievedGoals: goals.filter(g => g.goalAchieved).length,
      avgProgress: goalsWithProgress.length > 0 ? 
        goalsWithProgress.reduce((sum, g) => sum + g.progress, 0) / goalsWithProgress.length : 0
    };

    res.status(200).json({
      success: true,
      data: {
        goals: goalsWithProgress,
        summary
      }
    });
  } catch (error) {
    console.error('Error in getGoalProgress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goal progress',
      error: error.message
    });
  }
};

// Get investment recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Generating recommendations for user:', userId);

    const investments = await Investment.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      isActive: true 
    }).lean();

    const recommendations = [];

    investments.forEach(investment => {
      const principal = investment.principalAmount || 0;
      const currentValue = investment.currentValue || investment.principalAmount || 0;
      const roi = principal > 0 ? ((currentValue - principal) / principal) * 100 : 0;
      const daysInvested = investment.purchaseDate ? 
        Math.floor((new Date() - new Date(investment.purchaseDate)) / (1000 * 60 * 60 * 24)) : 0;
      
      // Performance-based recommendations
      if (roi < -20) {
        recommendations.push({
          type: 'alert',
          investment: investment.instrumentName,
          message: 'Consider reviewing this investment - significant loss detected',
          priority: 'high'
        });
      }
      
      if (roi > 50 && daysInvested > 365) {
        recommendations.push({
          type: 'profit_taking',
          investment: investment.instrumentName,
          message: 'Consider taking profits - excellent performance achieved',
          priority: 'medium'
        });
      }
      
      // Goal-based recommendations
      if (investment.targetAmount && currentValue >= investment.targetAmount) {
        recommendations.push({
          type: 'goal_achieved',
          investment: investment.instrumentName,
          message: 'Investment goal achieved! Consider your next step',
          priority: 'low'
        });
      }
    });

    console.log('Generated recommendations:', recommendations.length);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length
      }
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

// Update investment performance
export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue, currentPrice } = req.body;
    const userId = req.user.id;

    const investment = await Investment.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    investment.currentValue = currentValue;
    if (currentPrice) investment.currentPrice = currentPrice;
    
    // Add to performance history
    investment.performanceHistory.push({
      date: new Date(),
      value: currentValue,
      return: currentValue - investment.principalAmount,
      returnPercentage: investment.principalAmount > 0 ? 
        ((currentValue - investment.principalAmount) / investment.principalAmount) * 100 : 0
    });

    await investment.save();

    res.status(200).json({
      success: true,
      message: 'Performance updated successfully',
      data: investment
    });
  } catch (error) {
    console.error('Error in updatePerformance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating performance',
      error: error.message
    });
  }
};
