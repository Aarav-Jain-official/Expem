// InvestmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  Brain, Wallet, Globe, Calculator, Settings, LogOut, Plus,
  RefreshCw, MessageCircle, Zap, Target, Shield, Award
} from 'lucide-react';
import PortfolioTab from '../../components/PFtab.jsx';
import MarketDataTab from '../../components/MKTdata.jsx';
import MutualFundsTab from '../../components/MuF.jsx';
import AIAdvisorTab from '../../components/AiAdv.jsx';
import AnalyticsTab from '../../components/AnaTab.jsx';
import { useAuth } from '../../hooks/UseAuth.jsx';
import { useNavigate } from 'react-router-dom';

const InvestmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [goldPrices, setGoldPrices] = useState({});
  const [indices, setIndices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    todayPL: 0,
    totalReturns: 0,
    returnsPercentage: 0
  });

  const { authToken, logout } = useAuth();
  const navigate = useNavigate();

  // API Integration Functions
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, replace with actual API calls
      // Example: NSE API integration
      const stocksResponse = await fetch('/api/nse/stocks', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (stocksResponse.ok) {
        const stocks = await stocksResponse.json();
        setMarketData(stocks);
      } else {
        // Fallback to sample data
        setMarketData(sampleStocksData);
      }

      // Gold prices API
      const goldResponse = await fetch('/api/gold-prices', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (goldResponse.ok) {
        const gold = await goldResponse.json();
        setGoldPrices(gold);
      } else {
        setGoldPrices(sampleGoldPrices);
      }

      // Indices API
      const indicesResponse = await fetch('/api/indices', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (indicesResponse.ok) {
        const indices = await indicesResponse.json();
        setIndices(indices);
      } else {
        setIndices(sampleIndices);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Use sample data on error
      setMarketData(sampleStocksData);
      setGoldPrices(sampleGoldPrices);
      setIndices(sampleIndices);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPortfolio = async () => {
    try {
      const response = await fetch('/api/user/portfolio', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userPortfolio = await response.json();
        setPortfolio(userPortfolio);
        calculatePortfolioSummary(userPortfolio);
      } else {
        // Use sample portfolio
        const sample = getSamplePortfolio();
        setPortfolio(sample);
        calculatePortfolioSummary(sample);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      const sample = getSamplePortfolio();
      setPortfolio(sample);
      calculatePortfolioSummary(sample);
    }
  };

  const calculatePortfolioSummary = (portfolioData) => {
    let totalValue = 0;
    let todayPL = 0;
    let totalInvested = 0;

    portfolioData.forEach(holding => {
      const currentValue = holding.quantity * holding.currentPrice;
      const investedValue = holding.quantity * holding.avgPrice;
      
      totalValue += currentValue;
      totalInvested += investedValue;
      
      // Calculate today's P&L (simulated)
      const dayChange = marketData.find(stock => stock.symbol === holding.symbol)?.change || 0;
      todayPL += (currentValue * dayChange) / 100;
    });

    const totalReturns = totalValue - totalInvested;
    const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    setPortfolioSummary({
      totalValue,
      todayPL,
      totalReturns,
      returnsPercentage
    });
  };

  // Real-time data updates
  useEffect(() => {
    fetchMarketData();
    fetchUserPortfolio();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, [authToken]);

  // Auto-refresh portfolio when market data changes
  useEffect(() => {
    if (portfolio.length > 0 && marketData.length > 0) {
      calculatePortfolioSummary(portfolio);
    }
  }, [marketData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabsConfig = [
    { key: 'portfolio', label: 'Portfolio', icon: Wallet, color: 'blue' },
    { key: 'market', label: 'Market Data', icon: Globe, color: 'green' },
    { key: 'mutual-funds', label: 'Mutual Funds', icon: PieChart, color: 'purple' },
    { key: 'ai-advisor', label: 'AI Advisor', icon: Brain, color: 'orange' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, color: 'teal' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Investment Manager
                </h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
                <span>•</span>
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={fetchMarketData}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Portfolio Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Portfolio Value */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{portfolioSummary.totalValue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Today's P&L */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's P&L</p>
                <p className={`text-2xl font-bold ${portfolioSummary.todayPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioSummary.todayPL >= 0 ? '+' : ''}₹{portfolioSummary.todayPL.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </p>
              </div>
              <div className={`p-3 rounded-full ${portfolioSummary.todayPL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {portfolioSummary.todayPL >= 0 ? 
                  <TrendingUp className="text-green-600 w-6 h-6" /> :
                  <TrendingDown className="text-red-600 w-6 h-6" />
                }
              </div>
            </div>
          </div>

          {/* Total Returns */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Returns</p>
                <p className={`text-2xl font-bold ${portfolioSummary.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioSummary.totalReturns >= 0 ? '+' : ''}₹{portfolioSummary.totalReturns.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </p>
                <p className={`text-sm ${portfolioSummary.returnsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({portfolioSummary.returnsPercentage >= 0 ? '+' : ''}{portfolioSummary.returnsPercentage.toFixed(2)}%)
                </p>
              </div>
              <div className={`p-3 rounded-full ${portfolioSummary.totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Target className={`w-6 h-6 ${portfolioSummary.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          {/* Market Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">NIFTY 50</p>
                <p className="text-2xl font-bold text-gray-900">
                  {indices.NIFTY?.value?.toLocaleString('en-IN') || '24,619'}
                </p>
                <p className={`text-sm ${indices.NIFTY?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {indices.NIFTY?.change >= 0 ? '+' : ''}{indices.NIFTY?.change || 0.05}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8 bg-white rounded-xl overflow-hidden shadow-sm">
          {tabsConfig.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-0 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                  isActive
                    ? `bg-${tab.color}-600 text-white shadow-lg`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'portfolio' && (
            <PortfolioTab
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              marketData={marketData}
              loading={loading}
              authToken={authToken}
            />
          )}
          
          {activeTab === 'market' && (
            <MarketDataTab
              stocksData={marketData}
              goldPrices={goldPrices}
              indices={indices}
              loading={loading}
            />
          )}
          
          {activeTab === 'mutual-funds' && (
            <MutualFundsTab
              authToken={authToken}
              loading={loading}
            />
          )}
          
          {activeTab === 'ai-advisor' && (
            <AIAdvisorTab
              portfolio={portfolio}
              marketData={marketData}
              authToken={authToken}
            />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsTab
              portfolio={portfolio}
              portfolioSummary={portfolioSummary}
              marketData={marketData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Sample Data (fallback when APIs are not available)
const sampleStocksData = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2485.50, change: 1.2, sector: "Oil & Gas" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3890.25, change: -0.8, sector: "IT Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1632.80, change: 0.5, sector: "Banking" },
  { symbol: "INFY", name: "Infosys", price: 1815.60, change: -1.1, sector: "IT Services" },
  // ... more stocks
];

const sampleGoldPrices = {
  "24K": { price: 74500, unit: "per 10 grams", change: 0.8 },
  "22K": { price: 68300, unit: "per 10 grams", change: 0.8 },
  "18K": { price: 55900, unit: "per 10 grams", change: 0.8 }
};

const sampleIndices = {
  NIFTY: { value: 24619.35, change: 0.05 },
  SENSEX: { value: 80598.75, change: 0.07 },
  BANKNIFTY: { value: 51234.80, change: -0.2 }
};

const getSamplePortfolio = () => [
  { symbol: "RELIANCE", quantity: 50, avgPrice: 2400.00, currentPrice: 2485.50 },
  { symbol: "TCS", quantity: 25, avgPrice: 3800.00, currentPrice: 3890.25 },
  { symbol: "HDFCBANK", quantity: 75, avgPrice: 1600.00, currentPrice: 1632.80 },
  { symbol: "INFY", quantity: 40, avgPrice: 1850.00, currentPrice: 1815.60 },
  { symbol: "ITC", quantity: 200, avgPrice: 450.00, currentPrice: 456.75 }
];

export default InvestmentDashboard;
