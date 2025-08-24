// components/InvestmentDetails.jsx
import React, { useState } from 'react';

const InvestmentDetails = ({ investments, onRefresh }) => {
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');

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
    if (value > 0) return 'text-green-600 bg-green-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvestments = investments.filter(inv => 
    filterType === 'all' || inv.investmentType === filterType
  );

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortBy === 'purchaseDate') {
      return sortOrder === 'desc' 
        ? new Date(bVal) - new Date(aVal)
        : new Date(aVal) - new Date(bVal);
    }
    
    if (typeof aVal === 'number') {
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    }
    
    return sortOrder === 'desc' 
      ? bVal.localeCompare(aVal)
      : aVal.localeCompare(bVal);
  });

  const investmentTypes = [...new Set(investments.map(inv => inv.investmentType))];

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {investmentTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="purchaseDate">Purchase Date</option>
              <option value="currentValue">Current Value</option>
              <option value="currentROI">ROI</option>
              <option value="instrumentName">Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          
          <button
            onClick={onRefresh}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedInvestments.map((investment) => (
          <div key={investment._id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold mr-3">
                  {investment.instrumentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{investment.instrumentName}</h3>
                  <p className="text-sm text-gray-600">{investment.investmentType.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(investment.riskLevel)}`}>
                {investment.riskLevel}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal:</span>
                <span className="font-semibold">{formatCurrency(investment.principalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Value:</span>
                <span className="font-semibold">{formatCurrency(investment.currentValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI:</span>
                <span className={`font-semibold px-2 py-1 rounded ${getPerformanceColor(investment.currentROI)}`}>
                  {formatPercentage(investment.currentROI)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Invested:</span>
                <span className="font-semibold">{investment.daysInvested || 0}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Performance</span>
                <span>{formatPercentage(investment.currentROI)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    (investment.currentROI || 0) > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${Math.min(Math.abs(investment.currentROI || 0), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Edit
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Update Price
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedInvestments.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/50 text-center">
          <span className="text-6xl mb-4 block">📈</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No investments found</h3>
          <p className="text-gray-600">Start building your portfolio by adding your first investment</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentDetails;
