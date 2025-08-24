// components/EarningsChart.jsx
import React from 'react';

const EarningsChart = ({ summary }) => {
  if (!summary || !summary.summary) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  const maxAmount = Math.max(...summary.summary.map(item => item.totalAmount));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-8">Earnings by Category</h2>
      
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:justify-center md:items-end space-y-8 md:space-y-0 md:space-x-12 min-h-80">
          {summary.summary.map((item) => (
            <div key={item._id} className="flex flex-col items-center">
              <div 
                className={`w-20 rounded-t-lg flex items-start justify-center pt-2 transition-opacity duration-300 hover:opacity-80 ${
                  item._id === 'salary' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ 
                  height: `${Math.max((item.totalAmount / maxAmount) * 300, 50)}px`
                }}
              >
                <span className="text-white font-semibold text-xs">
                  ${item.totalAmount.toFixed(0)}
                </span>
              </div>
              <div className="mt-3 font-semibold text-gray-800 capitalize">
                {item._id}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.summary.map((item) => (
            <div key={item._id} className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 capitalize">{item._id}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Total:</span> ${item.totalAmount.toFixed(2)}</p>
                <p><span className="font-medium">Count:</span> {item.count}</p>
                <p><span className="font-medium">Average:</span> ${item.avgAmount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
