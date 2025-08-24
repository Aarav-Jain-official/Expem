// components/MutualFundsTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, TrendingUp, TrendingDown, Calculator, 
  PieChart, Target, DollarSign, Calendar, 
  Edit2, Trash2, Search, Filter 
} from 'lucide-react';

const MutualFundsTab = ({ authToken, loading }) => {
  const [mutualFunds, setMutualFunds] = useState([]);
  const [userSIPs, setUserSIPs] = useState([]);
  const [showSIPForm, setShowSIPForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMutualFunds();
    fetchUserSIPs();
  }, []);

  const fetchMutualFunds = async () => {
    try {
      const response = await fetch('/api/mutual-funds', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMutualFunds(data);
      } else {
        // Fallback data
        setMutualFunds(sampleMutualFunds);
      }
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
      setMutualFunds(sampleMutualFunds);
    }
  };

  const fetchUserSIPs = async () => {
    try {
      const response = await fetch('/api/user/sips', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserSIPs(data);
      } else {
        setUserSIPs(sampleUserSIPs);
      }
    } catch (error) {
      console.error('Error fetching user SIPs:', error);
      setUserSIPs(sampleUserSIPs);
    }
  };

  const addSIP = async (sipData) => {
    try {
      const response = await fetch('/api/user/sips', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sipData),
      });

      if (response.ok) {
        const newSIP = await response.json();
        setUserSIPs(prev => [...prev, newSIP]);
      }
    } catch (error) {
      console.error('Error adding SIP:', error);
    }
  };

  const filteredFunds = mutualFunds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fund.fundHouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fund.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(mutualFunds.map(fund => fund.category))];

  const MutualFundCard = ({ fund }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{fund.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{fund.fundHouse}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            fund.category === 'Large Cap' ? 'bg-blue-100 text-blue-800' :
            fund.category === 'Mid Cap' ? 'bg-green-100 text-green-800' :
            fund.category === 'Small Cap' ? 'bg-red-100 text-red-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {fund.category}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">₹{fund.nav.toFixed(2)}</div>
          <div className="text-sm text-gray-600">NAV</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">1Y Returns</span>
          <span className={`font-semibold flex items-center ${
            parseFloat(fund.returns) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {parseFloat(fund.returns) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {fund.returns}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Risk Level</span>
          <span className={`font-semibold ${
            fund.riskLevel === 'High' ? 'text-red-600' :
            fund.riskLevel === 'Moderate' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {fund.riskLevel || 'Moderate'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Min SIP</span>
          <span className="font-semibold">₹{fund.minSIP || 500}</span>
        </div>

        <div className="pt-3 border-t">
          <button 
            onClick={() => setShowSIPForm({ fund })}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start SIP
          </button>
        </div>
      </div>
    </div>
  );

  const SIPCard = ({ sip }) => {
    const nextDate = new Date(sip.nextDate);
    const totalInvested = sip.amount * sip.installmentsPaid;
    const currentValue = totalInvested * (1 + parseFloat(sip.returns.replace('%', '')) / 100);
    const gains = currentValue - totalInvested;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{sip.fundName}</h3>
            <p className="text-gray-600 text-sm">{sip.fundHouse}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
              <Edit2 size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600 text-sm">Monthly SIP</p>
            <p className="text-xl font-bold text-gray-900">₹{sip.amount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Current Value</p>
            <p className="text-xl font-bold text-gray-900">₹{currentValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Invested</span>
            <span className="font-semibold">₹{totalInvested.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gains</span>
            <span className={`font-semibold ${gains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gains >= 0 ? '+' : ''}₹{gains.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next SIP</span>
            <span className="font-semibold">{nextDate.toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            sip.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {sip.status}
          </span>
          <span className="text-gray-600 text-sm">
            {sip.installmentsPaid} installments paid
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mutual Funds & SIP</h2>
          <p className="text-gray-600">Invest systematically in top performing mutual funds</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator size={20} />
            <span>SIP Calculator</span>
          </button>
          <button
            onClick={() => setShowSIPForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Start SIP</span>
          </button>
        </div>
      </div>

      {/* My SIPs Section */}
      {userSIPs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">My SIPs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userSIPs.map((sip, index) => (
              <SIPCard key={index} sip={sip} />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mutual funds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Available Funds */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Available Mutual Funds ({filteredFunds.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund, index) => (
            <MutualFundCard key={index} fund={fund} />
          ))}
        </div>
      </div>

      {/* SIP Form Modal */}
      {showSIPForm && (
        <SIPFormModal
          fund={showSIPForm.fund}
          onClose={() => setShowSIPForm(false)}
          onSave={addSIP}
          funds={mutualFunds}
        />
      )}

      {/* SIP Calculator Modal */}
      {showCalculator && (
        <SIPCalculatorModal onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
};

// SIP Form Modal Component
const SIPFormModal = ({ fund, onClose, onSave, funds }) => {
  const [formData, setFormData] = useState({
    fundId: fund?.id || '',
    amount: '',
    date: '1',
    duration: '12'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedFund = funds.find(f => f.id === formData.fundId) || fund;
    
    onSave({
      ...formData,
      fundName: selectedFund.name,
      fundHouse: selectedFund.fundHouse,
      amount: parseInt(formData.amount),
      duration: parseInt(formData.duration),
      nextDate: getNextSIPDate(parseInt(formData.date))
    });
    onClose();
  };

  const getNextSIPDate = (date) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(date);
    return nextMonth.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">Start New SIP</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Fund</label>
            <select
              value={formData.fundId}
              onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a fund</option>
              {funds.map((f, i) => (
                <option key={i} value={f.id || i}>
                  {f.name} - {f.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Amount (₹)</label>
            <input
              type="number"
              min="500"
              step="500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SIP Date</label>
            <select
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(28)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12">1 Year</option>
              <option value="36">3 Years</option>
              <option value="60">5 Years</option>
              <option value="120">10 Years</option>
            </select>
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
              Start SIP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// SIP Calculator Modal
const SIPCalculatorModal = ({ onClose }) => {
  const [inputs, setInputs] = useState({
    monthlyAmount: 5000,
    annualReturn: 12,
    timePeriod: 10
  });
  
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    maturityValue: 0
  });

  useEffect(() => {
    calculateSIP();
  }, [inputs]);

  const calculateSIP = () => {
    const { monthlyAmount, annualReturn, timePeriod } = inputs;
    const monthlyReturn = annualReturn / 12 / 100;
    const totalMonths = timePeriod * 12;
    
    const futureValue = monthlyAmount * 
      (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn));
    
    const totalInvestment = monthlyAmount * totalMonths;
    const estimatedReturns = futureValue - totalInvestment;
    
    setResults({
      totalInvestment: Math.round(totalInvestment),
      estimatedReturns: Math.round(estimatedReturns),
      maturityValue: Math.round(futureValue)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-bold mb-4">SIP Calculator</h3>
        
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Investment (₹{inputs.monthlyAmount.toLocaleString('en-IN')})
              </label>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={inputs.monthlyAmount}
                onChange={(e) => setInputs({...inputs, monthlyAmount: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Annual Return ({inputs.annualReturn}%)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={inputs.annualReturn}
                onChange={(e) => setInputs({...inputs, annualReturn: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period ({inputs.timePeriod} years)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={inputs.timePeriod}
                onChange={(e) => setInputs({...inputs, timePeriod: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Investment</span>
              <span className="font-bold text-gray-900">₹{results.totalInvestment.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Estimated Returns</span>
              <span className="font-bold text-green-600">₹{results.estimatedReturns.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-700 font-medium">Maturity Value</span>
              <span className="font-bold text-2xl text-blue-600">₹{results.maturityValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



export default MutualFundsTab;
