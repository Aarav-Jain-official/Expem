// components/EarningsForm.jsx
import React, { useState } from 'react';
import customFetch from '../hooks/CustomFetch.js';

const EarningsForm = ({ onClose, onEarningAdded, authToken, handleAuthError }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'salary',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['salary', 'investment return', 'bonus', 'other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation (same pattern as your TransactionManager)
    if (!formData.amount || !formData.category || !formData.description.trim()) {
      setError('Please fill in all required fields: amount, category, and description');
      return;
    }

    setLoading(true);
    setError('');

    // Match backend expectations exactly (same as your pattern)
    const newEarning = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      type: 'credit', // Always credit for earnings
      category: formData.category,
      date: formData.date
    };

    console.log('=== EARNING CREATE REQUEST ===');
    console.log('Sending to backend:', newEarning);
    console.log('================================');

    try {
      const response = await customFetch('/transact', {
        method: 'POST',
        body: newEarning
      }, authToken, handleAuthError);

      if (response) {
        onEarningAdded();
        alert('Earning created successfully!');
      }
    } catch (error) {
      setError('Failed to create earning: ' + error.message);
      console.error('Error creating earning:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Earning</h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter earning description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
            >
              {loading ? 'Adding...' : 'Add Earning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EarningsForm;
