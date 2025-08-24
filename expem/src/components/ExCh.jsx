// components/ExpenseChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  Utensils, Car, ShoppingCart, MoreHorizontal, 
  Home, Heart, TrendingDown, DollarSign 
} from 'lucide-react';

const categoryIcons = {
  food: { Icon: Utensils, color: '#f97316' }, // orange-500
  transportation: { Icon: Car, color: '#3b82f6' }, // blue-500
  shopping: { Icon: ShoppingCart, color: '#a855f7' }, // purple-500
  entertainment: { Icon: MoreHorizontal, color: '#ec4899' }, // pink-500
  utilities: { Icon: Home, color: '#10b981' }, // green-500
  healthcare: { Icon: Heart, color: '#ef4444' }, // red-500
  other: { Icon: MoreHorizontal, color: '#6b7280' }, // gray-500
};

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#ec4899', '#10b981', '#ef4444', '#6b7280'];

const ExpenseChart = ({ summary }) => {
  if (!summary || !summary.summary || summary.summary.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingDown className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No expense data available
        </h3>
        <p className="text-gray-500">
          Add some expenses to see analytics and charts.
        </p>
      </div>
    );
  }

  const pieData = summary.summary.map((item, index) => ({
    name: item._id,
    value: item.totalAmount,
    count: item.count,
    avgAmount: item.avgAmount,
    color: COLORS[index % COLORS.length]
  }));

  const barData = summary.summary.map((item) => ({
    category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    amount: item.totalAmount,
    count: item.count,
    avgAmount: item.avgAmount
  }));

  const totalExpenses = summary.totalExpenses || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold capitalize">{`${data.name || label}`}</p>
          <p className="text-red-600">{`Amount: $${data.value?.toFixed(2) || data.amount?.toFixed(2)}`}</p>
          <p className="text-gray-600">{`Transactions: ${data.count}`}</p>
          <p className="text-gray-600">{`Average: $${data.avgAmount?.toFixed(2)}`}</p>
          {data.value && totalExpenses > 0 && (
            <p className="text-gray-500">{`${((data.value / totalExpenses) * 100).toFixed(1)}% of total`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Expense Analytics</h2>
        <p className="text-gray-600">Visual breakdown of your spending patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-2xl font-bold text-gray-800">{summary.summary.length}</p>
            </div>
            <div className="text-blue-500">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.summary.reduce((sum, cat) => sum + cat.count, 0)}
              </p>
            </div>
            <div className="text-green-500">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg/Transaction</p>
              <p className="text-2xl font-bold text-gray-800">
                ${(totalExpenses / summary.summary.reduce((sum, cat) => sum + cat.count, 0)).toFixed(2)}
              </p>
            </div>
            <div className="text-purple-500">
              <MoreHorizontal size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.summary.map((category, index) => {
            const { Icon, color } = categoryIcons[category._id.toLowerCase()] || 
                                  { Icon: MoreHorizontal, color: '#6b7280' };
            const percentage = totalExpenses > 0 ? (category.totalAmount / totalExpenses * 100) : 0;
            
            return (
              <div key={category._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">{category._id}</h4>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-semibold text-gray-800">${category.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="font-semibold text-gray-800">${category.avgAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Percentage</span>
                    <span className="font-semibold text-red-600">{percentage.toFixed(1)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: color,
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
