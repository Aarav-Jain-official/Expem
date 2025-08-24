// components/EarningsOverview.jsx
import React from 'react';

const EarningsOverview = ({ summary }) => {
  if (!summary) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading summary...</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Total Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${summary.totalEarnings?.toFixed(2) || '0.00'}
          </p>
        </div>
        
        {summary.summary?.map((item) => (
          <div 
            key={item._id} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500"
          >
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {item._id}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ${item.totalAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              {item.count} transactions
            </p>
            <p className="text-sm text-gray-500">
              Avg: ${item.avgAmount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsOverview;
