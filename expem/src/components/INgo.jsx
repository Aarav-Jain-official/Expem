// components/InvestmentGoals.jsx
import React from 'react';

const InvestmentGoals = ({ goals }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const days = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-green-400 to-green-600';
    if (progress >= 75) return 'from-blue-400 to-blue-600';
    if (progress >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
  };

  const getStatusIcon = (progress, achieved) => {
    if (achieved) return '🎉';
    if (progress >= 90) return '🚀';
    if (progress >= 50) return '📈';
    return '🎯';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Investment Goals</h3>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            + Add Goal
          </button>
        </div>

        {goals && goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal, index) => {
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const progressPercentage = Math.min((goal.currentValue / goal.targetAmount) * 100, 100);
              
              return (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{getStatusIcon(progressPercentage, goal.goalAchieved)}</span>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{goal.instrumentName}</h4>
                        <p className="text-gray-600">
                          Target: {formatCurrency(goal.targetAmount)}
                          {goal.targetDate && ` by ${formatDate(goal.targetDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">{progressPercentage.toFixed(1)}%</div>
                      {daysRemaining !== null && (
                        <div className="text-sm text-gray-600">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Target date passed'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full transition-all duration-1000 shadow-sm`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Remaining: {formatCurrency(Math.max(goal.targetAmount - goal.currentValue, 0))}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200">
                        Edit Goal
                      </button>
                      {progressPercentage >= 100 && !goal.goalAchieved && (
                        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200">
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Investment Goals Set</h3>
            <p className="text-gray-600 mb-6">Set specific targets for your investments to track progress</p>
            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentGoals;
