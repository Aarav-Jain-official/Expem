import React from 'react';
import { 
  Utensils, Car, ShoppingCart, MoreHorizontal, 
  Home, Heart, Edit2, Trash2, Eye 
} from 'lucide-react';

const categoryIcons = {
  food: { Icon: Utensils, color: 'bg-orange-500' },
  transportation: { Icon: Car, color: 'bg-blue-500' },
  shopping: { Icon: ShoppingCart, color: 'bg-purple-500' },
  entertainment: { Icon: MoreHorizontal, color: 'bg-pink-500' },
  utilities: { Icon: Home, color: 'bg-green-500' },
  healthcare: { Icon: Heart, color: 'bg-red-500' },
  other: { Icon: MoreHorizontal, color: 'bg-gray-500' },
};

const ExpenseTable = ({ expenses, loading, detailed = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full w-12 h-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No expenses found
        </h3>
        <p className="text-gray-500">
          Start tracking your expenses by adding your first expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Expenses ({expenses.length})
      </h3>
      
      {expenses.map((expense) => {
        const { Icon, color } = categoryIcons[expense.category?.toLowerCase()] || 
                                { Icon: MoreHorizontal, color: 'bg-gray-500' };
        
        return (
          <div key={expense._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`${color} p-3 rounded-xl text-white`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{expense.description}</h3>
                  <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                  {detailed && (
                    <p className="text-xs text-gray-400">
                      ID: {expense._id}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  ${Number(expense.amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {detailed && (
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Expense
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseTable;
