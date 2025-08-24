// components/InvestmentAnalytics.jsx
import React from 'react';

const InvestmentAnalytics = ({ analytics }) => {
  const { performanceByType = [], riskDistribution = [] } = analytics;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return 'from-green-400 to-green-600';
    if (value < 0) return 'from-red-400 to-red-600';
    return 'from-gray-400 to-gray-600';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'from-green-400 to-green-600';
      case 'medium': return 'from-yellow-400 to-yellow-600';
      case 'high': return 'from-orange-400 to-orange-600';
      case 'very_high': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const maxValue = Math.max(...performanceByType.map(item => item.totalCurrentValue), 1);

  return (
    <div className="space-y-8">
      {/* Performance by Type */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance by Investment Type</h3>
        <div className="space-y-6">
          {performanceByType.map((item, index) => (
            <div key={item._id} className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-4 h-4 bg-gradient-to-r ${getPerformanceColor(item.avgROI)} rounded-full mr-3`}></div>
                  <span className="font-semibold text-gray-800 capitalize">
                    {item._id.replace('_', ' ')}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">({item.count} investments)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{formatCurrency(item.totalCurrentValue)}</div>
                  <div className={`text-sm ${item.avgROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(item.avgROI)} avg ROI
                  </div>
                </div>
              </div>
              
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getPerformanceColor(item.avgROI)} rounded-full transition-all duration-1000`}
                  style={{ width: `${(item.totalCurrentValue / maxValue) * 100}%` }}
                ></div>
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Principal: {formatCurrency(item.totalPrincipal)}</span>
                <span>P&L: {formatCurrency(item.totalProfitLoss)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Risk Distribution</h3>
          <div className="space-y-4">
            {riskDistribution.map((item, index) => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className={`w-6 h-6 bg-gradient-to-r ${getRiskColor(item._id)} rounded-full mr-3`}></div>
                  <div>
                    <span className="font-semibold text-gray-800 capitalize">{item._id.replace('_', ' ')}</span>
                    <div className="text-sm text-gray-600">{item.count} investments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{formatCurrency(item.totalAmount)}</div>
                  <div className="text-sm text-gray-600">{formatPercentage(item.avgExpectedReturn)} exp.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance Insights</h3>
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🏆</span>
                <span className="font-semibold text-green-800">Best Performer</span>
              </div>
              <div className="text-sm text-green-700">
                {performanceByType.length > 0 && (
                  <>
                    <p className="font-semibold capitalize">
                      {performanceByType[0]._id.replace('_', ' ')}
                    </p>
                    <p>{formatPercentage(performanceByType.avgROI)} average return</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">📊</span>
                <span className="font-semibold text-blue-800">Portfolio Diversity</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>{performanceByType.length} different investment types</p>
                <p>Well-diversified portfolio</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">⚖️</span>
                <span className="font-semibold text-purple-800">Risk Balance</span>
              </div>
              <div className="text-sm text-purple-700">
                <p>{riskDistribution.length} risk levels represented</p>
                <p>Balanced risk profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAnalytics;
