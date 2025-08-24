// components/AnalyticsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Target, Shield } from 'lucide-react';

const AnalyticsTab = ({ portfolio, portfolioSummary, marketData }) => {
  const pieChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1Y');
  
  useEffect(() => {
    if (portfolio.length > 0) {
      createPieChart();
      createPerformanceChart();
    }
  }, [portfolio, timeframe]);

  const createPieChart = () => {
    const canvas = pieChartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate portfolio allocation
    const allocation = {};
    let totalValue = 0;
    
    portfolio.forEach(holding => {
      const stock = marketData.find(s => s.symbol === holding.symbol);
      const sector = stock?.sector || 'Others';
      const value = holding.quantity * holding.currentPrice;
      
      allocation[sector] = (allocation[sector] || 0) + value;
      totalValue += value;
    });
    
    // Colors for sectors
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = -Math.PI / 2;
    
    Object.entries(allocation).forEach(([sector, value], index) => {
      const sliceAngle = (value / totalValue) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Draw sector label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      const percentage = ((value / totalValue) * 100).toFixed(1);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${percentage}%`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });
  };

  const createPerformanceChart = () => {
    const canvas = performanceChartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate sample performance data
    const months = getMonthsArray(timeframe);
    const performanceData = generatePerformanceData(months);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Find min/max values
    const values = performanceData.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    
    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw performance line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    performanceData.forEach((point, index) => {
      const x = padding + (chartWidth / (performanceData.length - 1)) * index;
      const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#3B82F6';
    performanceData.forEach((point, index) => {
      const x = padding + (chartWidth / (performanceData.length - 1)) * index;
      const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels (months)
    performanceData.forEach((point, index) => {
      if (index % Math.ceil(performanceData.length / 6) === 0) {
        const x = padding + (chartWidth / (performanceData.length - 1)) * index;
        ctx.fillText(point.month, x, canvas.height - 10);
      }
    });
    
    // Y-axis labels (values)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + ((maxValue - minValue) / 5) * i;
      const y = padding + chartHeight - (chartHeight / 5) * i;
      ctx.fillText(`₹${Math.round(value / 1000)}K`, padding - 10, y + 4);
    }
  };

  const getMonthsArray = (timeframe) => {
    const months = [];
    const count = timeframe === '1Y' ? 12 : timeframe === '3Y' ? 36 : 60;
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-IN', { month: 'short' }));
    }
    
    return months;
  };

  const generatePerformanceData = (months) => {
    let currentValue = portfolioSummary.totalValue - portfolioSummary.totalReturns;
    const monthlyGrowth = 0.01; // 1% average monthly growth
    
    return months.map((month) => {
      currentValue *= (1 + monthlyGrowth + (Math.random() - 0.5) * 0.02);
      return {
        month,
        value: currentValue
      };
    });
  };

  const sectorAllocation = () => {
    const allocation = {};
    let totalValue = 0;
    
    portfolio.forEach(holding => {
      const stock = marketData.find(s => s.symbol === holding.symbol);
      const sector = stock?.sector || 'Others';
      const value = holding.quantity * holding.currentPrice;
      
      allocation[sector] = (allocation[sector] || 0) + value;
      totalValue += value;
    });
    
    return Object.entries(allocation).map(([sector, value]) => ({
      sector,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1)
    }));
  };

  const riskMetrics = {
    beta: 1.2,
    sharpeRatio: 1.8,
    volatility: 15.6,
    maxDrawdown: 8.3
  };

  const performanceMetrics = [
    { label: '1 Month', value: '+2.4%', positive: true },
    { label: '3 Months', value: '+7.8%', positive: true },
    { label: '6 Months', value: '+12.5%', positive: true },
    { label: '1 Year', value: '+18.9%', positive: true },
    { label: '3 Years', value: '+45.2%', positive: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Analytics</h2>
        <p className="text-gray-600">Detailed analysis of your investment performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Return</h3>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className={`text-2xl font-bold ${portfolioSummary.returnsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioSummary.returnsPercentage >= 0 ? '+' : ''}{portfolioSummary.returnsPercentage.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Sharpe Ratio</h3>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{riskMetrics.sharpeRatio}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Beta</h3>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{riskMetrics.beta}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Volatility</h3>
            <Shield className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{riskMetrics.volatility}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Portfolio Performance</h3>
            <div className="flex space-x-2">
              {['1Y', '3Y', '5Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <canvas
            ref={performanceChartRef}
            width="400"
            height="250"
            className="w-full h-auto"
          />
        </div>

        {/* Sector Allocation */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sector Allocation</h3>
          <div className="flex">
            <canvas
              ref={pieChartRef}
              width="200"
              height="200"
              className="w-48 h-48"
            />
            <div className="ml-6 space-y-2 flex-1">
              {sectorAllocation().map((item, index) => (
                <div key={item.sector} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'][index % 8]
                      }}
                    />
                    <span className="text-sm text-gray-700">{item.sector}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Time-based Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className={`text-lg font-bold ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Risk Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Beta (Market Risk)</span>
                <span className="font-semibold">{riskMetrics.beta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatility</span>
                <span className="font-semibold">{riskMetrics.volatility}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Drawdown</span>
                <span className="font-semibold text-red-600">-{riskMetrics.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sharpe Ratio</span>
                <span className="font-semibold text-green-600">{riskMetrics.sharpeRatio}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Risk Assessment</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Risk</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Moderate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Diversification</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Concentration Risk</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
