import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth';

const TransactionManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    type: 'credit',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  });

  const { authToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8000/api/v1/users/transact';

  const EARNINGS_CATEGORIES = ['salary', 'investment return', 'bonus', 'other'];
  const EXPENSE_CATEGORIES = ['food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'other'];

  const getAvailableCategories = (type) => {
    return type === 'credit' ? EARNINGS_CATEGORIES : EXPENSE_CATEGORIES;
  };

  useEffect(() => {
    if (authToken) {
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    if (!authToken) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setTransactions(data.data);
      } else if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError('Failed to fetch transactions: ' + err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    setError('Session expired. Please login again.');
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      type: 'credit',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
    setEditingTransaction(null);
    setShowEditForm(false);
  };

  const validateCategory = (type, category) => {
    const validCategories = getAvailableCategories(type);
    return validCategories.includes(category);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description.trim()) {
      alert('Please fill in all required fields: amount, category, and description');
      return;
    }

    if (!validateCategory(formData.type, formData.category)) {
      alert(`Invalid category "${formData.category}" for ${formData.type} transaction`);
      return;
    }

    setLoading(true);
    setError('');

    const newTransaction = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      status: formData.status
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newTransaction)
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const createdTransaction = result.data || result;
      
      setTransactions(prev => [...prev, createdTransaction]);
      resetForm();
      alert('Transaction created successfully!');
      
    } catch (err) {
      setError('Failed to create transaction: ' + err.message);
      console.error('Error creating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editingTransaction) {
      console.error('No editing transaction selected');
      return;
    }

    const validationErrors = [];
    
    if (!formData.description?.trim()) {
      validationErrors.push('Description is required');
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      validationErrors.push('Amount must be a positive number');
    }
    
    if (!formData.category) {
      validationErrors.push('Category is required');
    }
    
    if (!formData.type || !['credit', 'debit'].includes(formData.type)) {
      validationErrors.push('Valid transaction type is required');
    }
    
    if (!formData.date) {
      validationErrors.push('Date is required');
    }
    
    if (!formData.status || !['pending', 'completed', 'failed'].includes(formData.status)) {
      validationErrors.push('Status is required');
    }

    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }

    const normalizedCategory = formData.category.toLowerCase();
    if (!validateCategory(formData.type, normalizedCategory)) {
      alert(`Invalid category "${normalizedCategory}" for ${formData.type} transaction`);
      return;
    }

    setLoading(true);
    setError('');

    const updatedTransaction = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: normalizedCategory,
      date: formData.date,
      status: formData.status
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedTransaction)
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        let errorData = null;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch (parseError) {
          errorData = 'Unable to parse error response';
        }

        const errorMessage = typeof errorData === 'object' 
          ? (errorData?.message || errorData?.error || `HTTP ${response.status}`)
          : (errorData || `HTTP ${response.status}`);
          
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const updated = result.data || result;
      
      setTransactions(prev =>
        prev.map(transaction =>
          transaction._id === editingTransaction._id ? updated : transaction
        )
      );
      
      resetForm();
      alert('Transaction updated successfully!');
      
    } catch (err) {
      setError('Failed to update transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTransactions(prev => prev.filter(transaction => transaction._id !== id));
      alert('Transaction deleted successfully!');
    } catch (err) {
      setError('Failed to delete transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    if (!transaction._id) {
      alert('Cannot edit transaction: Missing ID');
      return;
    }

    setEditingTransaction(transaction);
    
    const editFormData = {
      type: transaction.type || 'credit',
      amount: (transaction.amount || 0).toString(),
      category: (transaction.category || '').toLowerCase(),
      description: transaction.description || '',
      date: transaction.date 
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T'),
      status: transaction.status || 'completed'
    };
    
    setFormData(editFormData);
    setShowEditForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSummary = () => {
    const credit = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const debit = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      credit,
      debit,
      balance: credit - debit,
      totalTransactions: transactions.length
    };
  };

  const tabs = [
    { id: 'create', label: 'Create Transaction', icon: '➕' },
    { id: 'manage', label: 'Manage Transactions', icon: '⚙️' },
    { id: 'summary', label: 'Summary', icon: '📊' }
  ];

  const summary = getSummary();

  if (!authToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">$</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xl text-white font-bold">$</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white">TransactApp</h1>
                <p className="text-gray-400">Manage your money with ease</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-gray-600"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-xl mb-6">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="float-right text-red-300 hover:text-red-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="text-lg font-medium text-white">Processing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          {/* Create Transaction Tab */}
          {activeTab === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Create New Transaction</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Transaction Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                      disabled={loading}
                    >
                      <option value="credit">Credit (Earnings)</option>
                      <option value="debit">Debit (Expenses)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                      disabled={loading}
                      required
                    >
                      <option value="">Select Category</option>
                      {getAvailableCategories(formData.type).map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                      disabled={loading}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter transaction description..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-400"
                    disabled={loading}
                    required
                    maxLength="200"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.description.length}/200 characters
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300"
                >
                  {loading ? 'Creating...' : 'Create Transaction'}
                </button>
              </form>
            </div>
          )}

          {/* Manage Transactions Tab */}
          {activeTab === 'manage' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Transactions</h2>
                {showEditForm && (
                  <button
                    onClick={resetForm}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Edit Form */}
              {showEditForm && editingTransaction && (
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-green-400 mb-4">
                    Editing: {editingTransaction.type} of ${editingTransaction.amount} in {editingTransaction.category}
                  </h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Transaction Type *
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                          disabled={loading}
                        >
                          <option value="credit">Credit (Earnings)</option>
                          <option value="debit">Debit (Expenses)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Amount *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                          disabled={loading}
                          required
                        >
                          <option value="">Select Category</option>
                          {getAvailableCategories(formData.type).map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                          disabled={loading}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-white"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-400"
                        disabled={loading}
                        required
                        maxLength="200"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300"
                      >
                        {loading ? 'Updating...' : 'Update Transaction'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={loading}
                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Transactions List */}
              {transactions.length > 0 ? (
                <div className="grid gap-4">
                  {transactions.map(transaction => (
                    <div
                      key={transaction._id}
                      className={`border rounded-xl p-4 transition-all duration-300 ${
                        transaction.type === 'credit'
                          ? 'border-green-500 bg-green-500 bg-opacity-10'
                          : 'border-red-500 bg-red-500 bg-opacity-10'
                      } ${editingTransaction?._id === transaction._id ? 'ring-2 ring-green-400' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                transaction.type === 'credit'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="font-semibold text-lg text-white">
                              ${transaction.amount.toFixed(2)}
                            </span>
                            <span className="text-gray-300 capitalize">{transaction.category}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                              transaction.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                              'bg-red-500 bg-opacity-20 text-red-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1">{transaction.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(transaction)}
                            disabled={loading}
                            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-300"
                          >
                            {editingTransaction?._id === transaction._id ? 'Editing...' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-600 text-6xl mb-4">📋</div>
                  <p className="text-gray-400 text-lg">No transactions found</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Financial Summary</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${summary.credit.toFixed(2)}
                  </div>
                  <div className="text-green-300 font-semibold">Total Earnings</div>
                </div>
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    ${summary.debit.toFixed(2)}
                  </div>
                  <div className="text-red-300 font-semibold">Total Expenses</div>
                </div>
                <div className={`border rounded-2xl p-6 text-center ${
                  summary.balance >= 0 
                    ? 'bg-blue-500 bg-opacity-20 border-blue-500' 
                    : 'bg-orange-500 bg-opacity-20 border-orange-500'
                }`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    summary.balance >= 0 ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    ${summary.balance.toFixed(2)}
                  </div>
                  <div className={`font-semibold ${
                    summary.balance >= 0 ? 'text-blue-300' : 'text-orange-300'
                  }`}>
                    Net Balance
                  </div>
                </div>
                <div className="bg-purple-500 bg-opacity-20 border border-purple-500 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {summary.totalTransactions}
                  </div>
                  <div className="text-purple-300 font-semibold">Total Transactions</div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(transaction => (
                      <div
                        key={transaction._id}
                        className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`inline-block w-3 h-3 rounded-full ${
                            transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <div>
                            <div className="font-semibold capitalize text-white">{transaction.category}</div>
                            <div className="text-sm text-gray-400">{transaction.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No transactions to display</p>
                )}
              </div>

              {/* Refresh Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
                >
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;
;

