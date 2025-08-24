// components/EarningsDashboard.jsx
import React, { useState, useEffect } from 'react';
import EarningsOverview from '../../components/Earningover.jsx';
import EarningsTable from '../../components/Earningtab.jsx';
import EarningsForm from '../../components/Earningform.jsx';
import EarningsChart from '../../components/Earningch.jsx';
import DateRangeFilter from '../../components/Datafil.jsx';
import customFetch from '../../hooks/CustomFetch.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.jsx';

const EarningsDashboard = () => {
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Authentication and navigation hooks (same as your pattern)
  const { authToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch earnings on component mount
  useEffect(() => {
    if (authToken) {
      fetchEarnings();
      fetchSummary();
    }
  }, []); // Removed authToken to prevent re-renders

  const handleAuthError = () => {
    setError('Session expired. Please login again.');
    logout();
    navigate('/login');
  };

  const fetchEarnings = async (params = {}) => {
  if (!authToken) return;
  
  setLoading(true);
  setError('');
  
  try {
    // Get ALL transactions first, then filter
    const response = await customFetch('/transact', {}, authToken, handleAuthError);
    
    if (response) {
      const allTransactions = response.success && response.data ? response.data : 
                             Array.isArray(response) ? response : [];
      
      // ✅ STRICT FILTERING: Only credit transactions in earnings categories
      const earningsCategories = ['salary', 'investment return'];
      
      let filteredEarnings = allTransactions.filter(transaction => {
        const isCredit = transaction.type === 'credit';
        const isEarningsCategory = earningsCategories.includes(transaction.category?.toLowerCase());
        
        console.log(`Transaction: ${transaction.description} - Type: ${transaction.type}, Category: ${transaction.category}, Include: ${isCredit && isEarningsCategory}`);
        
        return isCredit && isEarningsCategory;
      });
      
      // Apply additional date filters if provided
      if (params.startDate) {
        filteredEarnings = filteredEarnings.filter(t => 
          new Date(t.date) >= new Date(params.startDate)
        );
      }
      
      if (params.endDate) {
        filteredEarnings = filteredEarnings.filter(t => 
          new Date(t.date) <= new Date(params.endDate)
        );
      }
      
      console.log('🎯 Final earnings count:', filteredEarnings.length);
      setEarnings(filteredEarnings);
    }
  } catch (error) {
    setError('Failed to fetch earnings: ' + error.message);
    console.error('Error fetching earnings:', error);
  } finally {
    setLoading(false);
  }
};

// Update fetchSummary function to also filter properly

const fetchSummary = async () => {
  if (!authToken) return;
  
  try {
    // Get all transactions first
    const response = await customFetch('/transact', {}, authToken, handleAuthError);
    
    if (response) {
      const allTransactions = response.success && response.data ? response.data : 
                             Array.isArray(response) ? response : [];
      
      // ✅ Filter for ONLY credit transactions in earnings categories
      const earningsCategories = ['salary', 'investment return', 'bonus', 'other'];
      const earnings = allTransactions.filter(transaction => 
        transaction.type === 'credit' && 
        earningsCategories.includes(transaction.category?.toLowerCase())
      );
      
      console.log('📈 Summary - All transactions:', allTransactions.length);
      console.log('💼 Summary - Credit earnings:', earnings.length);
      
      // Create summary
      const summaryData = {
        totalEarnings: earnings.reduce((sum, t) => sum + t.amount, 0),
        summary: earningsCategories.map(category => {
          const categoryEarnings = earnings.filter(t => 
            t.category?.toLowerCase() === category.toLowerCase()
          );
          return {
            _id: category,
            totalAmount: categoryEarnings.reduce((sum, t) => sum + t.amount, 0),
            count: categoryEarnings.length,
            avgAmount: categoryEarnings.length > 0 ? 
              categoryEarnings.reduce((sum, t) => sum + t.amount, 0) / categoryEarnings.length : 0
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
    fetchEarnings(params);
  };

  const handleEarningAdded = () => {
    fetchEarnings();
    fetchSummary();
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading if no auth token (same as your pattern)
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
        {/* Header with Logout (same style as your TransactionManager) */}
        <div className="text-center mb-8 bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Earnings Dashboard</h1>
              <p className="text-green-100">Track and manage your income sources</p>
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
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Display (same as your pattern) */}
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

        {/* Loading Overlay (same as your pattern) */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-lg font-medium">Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-xl overflow-hidden shadow-lg">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'details', label: 'Details', icon: '📋' },
            { key: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button 
              key={tab.key}
              className={`flex-1 min-w-0 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
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
              <EarningsOverview summary={summary} />
              <DateRangeFilter onFilter={handleDateRangeFilter} />
              <EarningsTable earnings={earnings} loading={loading} />
              
              {/* Add New Earning Button */}
              <div className="mt-6 text-center">
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
                  onClick={() => setShowForm(true)}
                >
                  Add New Earning
                </button>
              </div>
            </>
          )}
          
          {activeTab === 'details' && (
            <EarningsTable earnings={earnings} loading={loading} detailed={true} />
          )}
          
          {activeTab === 'analytics' && (
            <EarningsChart summary={summary} />
          )}

          {/* Refresh Button (same as your pattern) */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                fetchEarnings();
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
          <EarningsForm 
            onClose={() => setShowForm(false)}
            onEarningAdded={handleEarningAdded}
            authToken={authToken}
            handleAuthError={handleAuthError}
          />
        )}
      </div>
    </div>
  );
};

export default EarningsDashboard;
