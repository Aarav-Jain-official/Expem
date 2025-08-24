// components/MarketDataTab.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, Filter } from 'lucide-react';

const MarketDataTab = ({ stocksData, goldPrices, indices, loading }) => {
  const [filteredStocks, setFilteredStocks] = useState(stocksData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  useEffect(() => {
    let filtered = stocksData;

    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSector !== 'all') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }

    setFilteredStocks(filtered);
  }, [stocksData, searchTerm, selectedSector]);

  const sectors = ['all', ...new Set(stocksData.map(stock => stock.sector))];
  const gainers = stocksData.filter(stock => stock.change > 0).sort((a, b) => b.change - a.change).slice(0, 5);
  const losers = stocksData.filter(stock => stock.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(indices).map(([key, data]) => (
            <div key={key} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold">{key}</h3>
              <p className="text-3xl font-bold">{data.value?.toLocaleString('en-IN')}</p>
              <p className={`flex items-center space-x-1 ${data.change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {data.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{data.change >= 0 ? '+' : ''}{data.change}%</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Gold Prices */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Gold Prices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(goldPrices).map(([karat, data]) => (
            <div key={karat} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{karat} Gold</h4>
                  <p className="text-2xl font-bold text-yellow-600">₹{data.price?.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600">{data.unit}</p>
                </div>
                <div className={`text-right ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center">
                    {data.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1">{data.change >= 0 ? '+' : ''}{data.change}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Gainers</h3>
          <div className="space-y-3">
            {gainers.map((stock) => (
              <div key={stock.symbol} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{stock.price}</p>
                    <p className="text-green-600 flex items-center">
                      <TrendingUp size={16} />
                      <span className="ml-1">+{stock.change}%</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Losers</h3>
          <div className="space-y-3">
            {losers.map((stock) => (
              <div key={stock.symbol} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{stock.price}</p>
                    <p className="text-red-600 flex items-center">
                      <TrendingDown size={16} />
                      <span className="ml-1">{stock.change}%</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Search and Filter */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">All Stocks</h3>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>
                {sector === 'all' ? 'All Sectors' : sector}
              </option>
            ))}
          </select>
        </div>

        {/* Stocks Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">₹{stock.price.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="ml-1 text-sm font-medium">
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataTab;
