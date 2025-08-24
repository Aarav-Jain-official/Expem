import React from 'react';
import { DollarSign, TrendingDown, ShoppingCart, CreditCard } from 'lucide-react';

const ExpenseOverview = ({ summary }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalExpenses = summary.totalExpenses || 0;
  const totalTransactions = summary.summary?.reduce((sum, cat) => sum + cat.count, 0) || 0;
  const avgPerTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Expenses */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100">Total Expenses</p>
            <p className="text-3xl font-bold">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl">
            <DollarSign size={32} />
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-800">
              {totalTransactions}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-xl">
            <ShoppingCart className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Average per Transaction */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Avg per Transaction</p>
            <p className="text-3xl font-bold text-gray-800">
              ${avgPerTransaction.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-xl">
            <TrendingDown className="text-purple-600" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseOverview;
