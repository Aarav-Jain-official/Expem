// components/ExpenseDashboard.jsx
import React, { useState, useEffect } from 'react';
import ExpenseOverview from '../../components/ExOv.jsx';
import ExpenseTable from '../../components/ExTa.jsx';
import ExpenseForm from '../../components/ExFo.jsx';
import ExpenseChart from '../../components/ExCh.jsx';
import DateRangeFilter from '../../components/Datafil.jsx';
import customFetch from '../../hooks/CustomFetch.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.jsx';

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Authentication and navigation hooks
  const { authToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch expenses on component mount
  useEffect(() => {
    if (authToken) {
      fetchExpenses();
      fetchSummary();
    }
  }, []);

  const handleAuthError = () => {
    setError('Session expired. Please login again.');
    logout();
    navigate('/login');
  };

  const fetchExpenses = async (params = {}) => {
    if (!authToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Get ALL transactions first, then filter
      const response = await customFetch('/transact', {}, authToken, handleAuthError);
      
      if (response) {
        const allTransactions = response.success && response.data ? response.data : 
                               Array.isArray(response) ? response : [];
        
        // ✅ STRICT FILTERING: Only debit transactions (expenses)
        const expenseCategories = ['food', 'transportation', 'shopping', 'entertainment', 'utilities', 'healthcare', 'other'];
        
        let filteredExpenses = allTransactions.filter(transaction => {
          const isDebit = transaction.type === 'debit';
          const isExpenseCategory = expenseCategories.includes(transaction.category?.toLowerCase());
          
          console.log(`Transaction: ${transaction.description} - Type: ${transaction.type}, Category: ${transaction.category}, Include: ${isDebit && isExpenseCategory}`);
          
          return isDebit && isExpenseCategory;
        });
        
        // Apply additional date filters if provided
        if (params.startDate) {
          filteredExpenses = filteredExpenses.filter(t => 
            new Date(t.date) >= new Date(params.startDate)
          );
        }
        
        if (params.endDate) {
          filteredExpenses = filteredExpenses.filter(t => 
            new Date(t.date) <= new Date(params.endDate)
          );
        }
        
        console.log('🛍️ Final expenses count:', filteredExpenses.length);
        setExpenses(filteredExpenses);
      }
    } catch (error) {
      setError('Failed to fetch expenses: ' + error.message);
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!authToken) return;
    
    try {
      // Get all transactions first
      const response = await customFetch('/transact', {}, authToken, handleAuthError);
      
      if (response) {
        const allTransactions = response.success && response.data ? response.data : 
                               Array.isArray(response) ? response : [];
        
        // ✅ Filter for ONLY debit transactions in expense categories
        const expenseCategories = ['food', 'transportation', 'shopping', 'entertainment', 'utilities', 'healthcare', 'other'];
        const expenses = allTransactions.filter(transaction => 
          transaction.type === 'debit' && 
          expenseCategories.includes(transaction.category?.toLowerCase())
        );
        
        console.log('📊 Summary - All transactions:', allTransactions.length);
        console.log('💸 Summary - Debit expenses:', expenses.length);
        
        // Create summary
        const summaryData = {
          totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
          summary: expenseCategories.map(category => {
            const categoryExpenses = expenses.filter(t => 
              t.category?.toLowerCase() === category.toLowerCase()
            );
            return {
              _id: category,
              totalAmount: categoryExpenses.reduce((sum, t) => sum + t.amount, 0),
              count: categoryExpenses.length,
              avgAmount: categoryExpenses.length > 0 ? 
                categoryExpenses.reduce((sum, t) => sum + t.amount, 0) / categoryExpenses.length : 0
            };
          }).filter(item => item.count > 0)
        };
        
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleDateRangeFilter = (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    fetchExpenses(params);
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    fetchSummary();
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading if no auth token
  if (!authToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Navigation */}
        <div className="text-center mb-8 bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Expense Dashboard</h1>
              <p className="text-red-100">Track and manage your spending</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-pink-600 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/transact')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-purple-600 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Transactions
              </button>
              <button
                onClick={() => navigate('/earn')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-green-600 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Earnings
              </button>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="text-lg font-medium">Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-xl overflow-hidden shadow-lg">
          {[
            { key: 'overview', label: 'Overview', icon: '💸' },
            { key: 'details', label: 'Details', icon: '📋' },
            { key: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button 
              key={tab.key}
              className={`flex-1 min-w-0 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === 'overview' && (
            <>
              <ExpenseOverview summary={summary} />
              <DateRangeFilter onFilter={handleDateRangeFilter} />
              <ExpenseTable expenses={expenses} loading={loading} />
              
              {/* Add New Expense Button */}
              <div className="mt-6 text-center">
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
                  onClick={() => setShowForm(true)}
                >
                  Add New Expense
                </button>
              </div>
            </>
          )}
          
          {activeTab === 'details' && (
            <ExpenseTable expenses={expenses} loading={loading} detailed={true} />
          )}
          
          {activeTab === 'analytics' && (
            <ExpenseChart summary={summary} />
          )}

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                fetchExpenses();
                fetchSummary();
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <ExpenseForm 
            onClose={() => setShowForm(false)}
            onExpenseAdded={handleExpenseAdded}
            authToken={authToken}
            handleAuthError={handleAuthError}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseDashboard;
