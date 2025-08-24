// components/PortfolioTab.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioTab = ({ portfolio, setPortfolio, marketData, loading, authToken }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);

  const addHolding = async (newHolding) => {
    try {
      const response = await fetch('/api/user/portfolio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHolding),
      });

      if (response.ok) {
        const added = await response.json();
        setPortfolio(prev => [...prev, added]);
      } else {
        // Fallback to local state
        const currentPrice = marketData.find(stock => stock.symbol === newHolding.symbol)?.price || newHolding.avgPrice;
        setPortfolio(prev => [...prev, { ...newHolding, currentPrice }]);
      }
    } catch (error) {
      console.error('Error adding holding:', error);
      const currentPrice = marketData.find(stock => stock.symbol === newHolding.symbol)?.price || newHolding.avgPrice;
      setPortfolio(prev => [...prev, { ...newHolding, currentPrice }]);
    }
  };

  const removeHolding = async (symbol) => {
    try {
      const response = await fetch(`/api/user/portfolio/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      setPortfolio(prev => prev.filter(h => h.symbol !== symbol));
    } catch (error) {
      console.error('Error removing holding:', error);
      setPortfolio(prev => prev.filter(h => h.symbol !== symbol));
    }
  };

  const HoldingCard = ({ holding }) => {
    const currentValue = holding.quantity * holding.currentPrice;
    const investedValue = holding.quantity * holding.avgPrice;
    const pl = currentValue - investedValue;
    const plPercentage = ((pl / investedValue) * 100);
    const stockInfo = marketData.find(stock => stock.symbol === holding.symbol);

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{holding.symbol}</h3>
            <p className="text-gray-600 text-sm">{stockInfo?.name || 'Stock Name'}</p>
            <p className="text-gray-500 text-xs">{stockInfo?.sector || 'Sector'}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingHolding(holding)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => removeHolding(holding.symbol)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-semibold">{holding.quantity}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Avg Price:</span>
            <span className="font-semibold">₹{holding.avgPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Price:</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">₹{holding.currentPrice.toFixed(2)}</span>
              {stockInfo && (
                <span className={`text-sm flex items-center ${stockInfo.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockInfo.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-bold text-lg">₹{currentValue.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">P&L:</span>
              <div className="text-right">
                <span className={`font-bold text-lg ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN')}
                </span>
                <span className={`block text-sm ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({pl >= 0 ? '+' : ''}{plPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Portfolio</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Holding</span>
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Holdings Yet</h3>
          <p className="text-gray-500 mb-6">Start building your portfolio by adding your first investment</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Holding
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((holding) => (
            <HoldingCard key={holding.symbol} holding={holding} />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingHolding) && (
        <AddHoldingModal
          holding={editingHolding}
          onClose={() => {
            setShowAddForm(false);
            setEditingHolding(null);
          }}
          onSave={addHolding}
          stocks={marketData}
        />
      )}
    </div>
  );
};

const AddHoldingModal = ({ holding, onClose, onSave, stocks }) => {
  const [formData, setFormData] = useState({
    symbol: holding?.symbol || '',
    quantity: holding?.quantity || '',
    avgPrice: holding?.avgPrice || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      symbol: formData.symbol,
      quantity: parseInt(formData.quantity),
      avgPrice: parseFloat(formData.avgPrice),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">
          {holding ? 'Edit Holding' : 'Add New Holding'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
            <select
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a stock</option>
              {stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Average Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.avgPrice}
              onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {holding ? 'Update' : 'Add'} Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioTab;
