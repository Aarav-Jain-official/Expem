// components/DividendHistory.jsx
import React, { useState, useEffect } from 'react';

const DividendHistory = ({ dividends }) => {
  const [filteredDividends, setFilteredDividends] = useState(dividends);
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    let filtered = dividends;
    
    // Filter by year
    if (filterYear !== 'all') {
      filtered = dividends.filter(div => 
        new Date(div.date).getFullYear().toString() === filterYear
      );
    }
    
    // Sort dividends
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });
    
    setFilteredDividends(filtered);
  }, [dividends, filterYear, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique years for filter
  const years = [...new Set(dividends.map(div => 
    new Date(div.date).getFullYear().toString()
  ))].sort((a, b) => b - a);

  // Calculate summary statistics
  const totalDividends = filteredDividends.reduce((sum, div) => sum + div.amount, 0);
  const avgDividend = totalDividends / (filteredDividends.length || 1);
  const monthlyBreakdown = filteredDividends.reduce((acc, div) => {
    const month = new Date(div.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + div.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Dividends</p>
              <p className="text-2xl font-bold">{formatCurrency(totalDividends)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Payments</p>
              <p className="text-2xl font-bold">{filteredDividends.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Payment</p>
              <p className="text-2xl font-bold">{formatCurrency(avgDividend)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Year</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  dividends
                    .filter(div => new Date(div.date).getFullYear() === new Date().getFullYear())
                    .reduce((sum, div) => sum + div.amount, 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredDividends.length} of {dividends.length} payments
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Monthly Dividend Income</h3>
        <div className="space-y-4">
          {Object.entries(monthlyBreakdown)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([month, amount]) => {
              const maxAmount = Math.max(...Object.values(monthlyBreakdown));
              const percentage = (amount / maxAmount) * 100;
              
              return (
                <div key={month} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{month}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Dividend History Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Dividend History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDividends.map((dividend, index) => (
                <tr key={dividend._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(dividend.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        💰
                      </div>
                      <div>
                        <div className="font-medium">{dividend.description}</div>
                        <div className="text-gray-500 text-xs">Investment Return</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(dividend.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dividend.status)}`}>
                      {dividend.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-200">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-900 transition-colors duration-200">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDividends.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No dividend history found</h3>
            <p className="text-gray-600">
              {filterYear === 'all' 
                ? 'Start investing in dividend-paying assets to see your returns here'
                : `No dividends received in ${filterYear}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DividendHistory;
