// components/EarningsTable.jsx
import React, { useState } from 'react';

const EarningsTable = ({ earnings, loading, detailed = false }) => {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading earnings...</div>
      </div>
    );
  }

  const sortedEarnings = [...earnings].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(bVal) - new Date(aVal)
        : new Date(aVal) - new Date(bVal);
    }
    
    if (sortBy === 'amount') {
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    }
    
    return sortOrder === 'desc' 
      ? bVal.localeCompare(aVal)
      : aVal.localeCompare(bVal);
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '';
    return sortOrder === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Earnings History</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              >
                Date{getSortIcon('date')}
              </th>
              <th 
                onClick={() => handleSort('description')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              >
                Description{getSortIcon('description')}
              </th>
              <th 
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              >
                Category{getSortIcon('category')}
              </th>
              <th 
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              >
                Amount{getSortIcon('amount')}
              </th>
              {detailed && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEarnings.map((earning) => (
              <tr key={earning._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(earning.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {earning.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    earning.category === 'salary' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {earning.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  ${earning.amount.toFixed(2)}
                </td>
                {detailed && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      earning.status === 'completed' ? 'bg-green-100 text-green-800' :
                      earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {earning.status}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {earnings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No earnings found</p>
        </div>
      )}
    </div>
  );
};

export default EarningsTable;
