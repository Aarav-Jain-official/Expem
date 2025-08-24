// components/Recommendations.jsx
import React, { useState } from 'react';

const Recommendations = ({ recommendations }) => {
  const [filter, setFilter] = useState('all');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '💡';
      default: return 'ℹ️';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return '⚠️';
      case 'profit_taking': return '💰';
      case 'goal_achieved': return '🎯';
      case 'rebalance': return '⚖️';
      case 'diversify': return '🌐';
      default: return '💡';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-200';
      case 'profit_taking': return 'bg-green-50 border-green-200';
      case 'goal_achieved': return 'bg-blue-50 border-blue-200';
      case 'rebalance': return 'bg-purple-50 border-purple-200';
      case 'diversify': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.priority === filter);

  const priorityCounts = recommendations.reduce((acc, rec) => {
    acc[rec.priority] = (acc[rec.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">High Priority</p>
              <p className="text-3xl font-bold">{priorityCounts.high || 0}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Medium Priority</p>
              <p className="text-3xl font-bold">{priorityCounts.medium || 0}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Low Priority</p>
              <p className="text-3xl font-bold">{priorityCounts.low || 0}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">💡</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Insights</p>
              <p className="text-3xl font-bold">{recommendations.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">Investment Insights & Recommendations</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by priority:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <div key={index} className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 ${getActionColor(rec.type)} hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-start space-x-4">
                <div className={`p-4 bg-gradient-to-r ${getPriorityColor(rec.priority)} rounded-2xl shadow-lg`}>
                  <span className="text-3xl">{getTypeIcon(rec.type)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-xl font-bold text-gray-800">{rec.investment}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPriorityColor(rec.priority)}`}>
                        {getPriorityIcon(rec.priority)} {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {rec.type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {rec.message}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      View Details
                    </button>
                    
                    {rec.type === 'alert' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        Take Action
                      </button>
                    )}
                    
                    {rec.type === 'profit_taking' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        Sell Portion
                      </button>
                    )}
                    
                    {rec.type === 'goal_achieved' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        Mark Complete
                      </button>
                    )}
                    
                    <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/50 text-center">
          <span className="text-6xl mb-4 block">🎉</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {filter === 'all' ? 'No Recommendations' : `No ${filter} Priority Recommendations`}
          </h3>
          <p className="text-gray-600 text-lg">
            {filter === 'all' 
              ? 'Your portfolio is looking great! No immediate actions needed.'
              : `No ${filter} priority items at this time.`
            }
          </p>
        </div>
      )}

      {/* Investment Tips */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Investment Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📚</span>
              <h4 className="font-semibold text-blue-800">Diversification</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Spread your investments across different asset classes to reduce risk and optimize returns.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⏰</span>
              <h4 className="font-semibold text-green-800">Regular Reviews</h4>
            </div>
            <p className="text-green-700 text-sm">
              Review your portfolio monthly to ensure it aligns with your financial goals and risk tolerance.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🎯</span>
              <h4 className="font-semibold text-purple-800">Goal Setting</h4>
            </div>
            <p className="text-purple-700 text-sm">
              Set clear, measurable investment goals with specific timelines to track your progress effectively.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">💡</span>
              <h4 className="font-semibold text-orange-800">Stay Informed</h4>
            </div>
            <p className="text-orange-700 text-sm">
              Keep up with market trends and company news that might affect your investments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
