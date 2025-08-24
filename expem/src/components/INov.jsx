// components/InvestmentOverview.jsx
import React from 'react';

const InvestmentOverview = ({ portfolioSummary, investments, recommendations }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPerformanceIcon = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➖';
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">💼</span>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Investments</p>
              <p className="text-2xl font-bold">{portfolioSummary.totalInvestments || 0}</p>
            </div>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Total Principal</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalPrincipal)}</p>
            </div>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-3/4 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalCurrentValue)}</p>
            </div>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-5/6 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">{getPerformanceIcon(portfolioSummary.totalROI)}</span>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Total ROI</p>
              <p className="text-2xl font-bold">{formatPercentage(portfolioSummary.totalROI)}</p>
            </div>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${
              (portfolioSummary.totalROI || 0) > 0 ? 'bg-green-400' : 'bg-red-400'
            }`} style={{ width: `${Math.min(Math.abs(portfolioSummary.totalROI || 0), 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Portfolio Performance</h3>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📈</span>
            <p className="text-gray-600 text-lg">Performance Chart</p>
            <p className="text-gray-500">Interactive chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Investments & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Investments */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Investments</h3>
          <div className="space-y-4">
            {investments.slice(0, 5).map((investment) => (
              <div key={investment._id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold mr-4">
                  {investment.instrumentName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{investment.instrumentName}</p>
                  <p className="text-sm text-gray-600">{investment.investmentType}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(investment.currentValue)}</p>
                  <p className={`text-sm ${getPerformanceColor(investment.currentROI)}`}>
                    {formatPercentage(investment.currentROI)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Insights</h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-xl border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-green-50 border-green-400'
              }`}>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">
                    {rec.type === 'alert' ? '⚠️' : 
                     rec.type === 'profit_taking' ? '💰' : '🎯'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{rec.investment}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                  </div>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">🎉</span>
                <p className="text-gray-600">No urgent recommendations</p>
                <p className="text-sm text-gray-500">Your portfolio looks good!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;
