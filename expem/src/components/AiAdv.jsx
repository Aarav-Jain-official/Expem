// components/AIAdvisorTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, TrendingUp, Shield, Target } from 'lucide-react';

const AIAdvisorTab = ({ portfolio, marketData, authToken }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm your AI Investment Advisor. I can help you with portfolio analysis, investment recommendations, and market insights. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    { text: "Analyze my portfolio", icon: Target },
    { text: "Should I invest in IT stocks?", icon: TrendingUp },
    { text: "Is gold a good investment now?", icon: Shield },
    { text: "How should I diversify?", icon: Zap },
  ];

  const sendMessage = async (message) => {
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');

    try {
      // OpenAI API Integration
      const response = await fetch('/api/ai/investment-advice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          portfolio,
          marketData,
          context: {
            totalPortfolioValue: portfolio.reduce((sum, holding) => 
              sum + (holding.quantity * holding.currentPrice), 0
            ),
            holdingsCount: portfolio.length,
            sectors: [...new Set(marketData.filter(stock => 
              portfolio.some(holding => holding.symbol === stock.symbol)
            ).map(stock => stock.sector))]
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          type: 'bot',
          content: data.advice,
          timestamp: new Date(),
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Fallback to simulated response
        const botMessage = await getSimulatedResponse(message, portfolio, marketData);
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
      const botMessage = await getSimulatedResponse(message, portfolio, marketData);
      setMessages(prev => [...prev, botMessage]);
    }

    setIsLoading(false);
  };

  const getSimulatedResponse = async (message, portfolio, marketData) => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();
    let response = "";
    let suggestions = [];

    if (lowerMessage.includes('portfolio') || lowerMessage.includes('analyze')) {
      const totalValue = portfolio.reduce((sum, holding) => sum + (holding.quantity * holding.currentPrice), 0);
      const sectors = [...new Set(marketData.filter(stock => 
        portfolio.some(holding => holding.symbol === stock.symbol)
      ).map(stock => stock.sector))];

      response = `Your portfolio analysis:

📊 **Portfolio Overview:**
- Total Value: ₹${totalValue.toLocaleString('en-IN')}
- Holdings: ${portfolio.length} stocks
- Sectors: ${sectors.join(', ')}

💡 **Key Insights:**
${portfolio.length < 5 ? '• Consider diversifying with more holdings (recommended: 8-12 stocks)' : '• Good diversification with multiple holdings'}
${sectors.length < 3 ? '• Add exposure to different sectors for better risk distribution' : '• Well-diversified across sectors'}
• Your largest holding represents ${((Math.max(...portfolio.map(h => h.quantity * h.currentPrice)) / totalValue) * 100).toFixed(1)}% of portfolio

🎯 **Recommendations:**
• Maintain 60% large-cap, 30% mid-cap, 10% small-cap allocation
• Consider adding defensive sectors like FMCG or Pharma
• Review and rebalance quarterly`;

      suggestions = ['How to rebalance portfolio?', 'Best stocks to add now?', 'Risk assessment'];
    } else if (lowerMessage.includes('it') || lowerMessage.includes('technology')) {
      response = `IT Sector Analysis:

📈 **Current Market View:**
• IT sector showing resilience with strong fundamentals
• Digital transformation driving long-term growth
• Export revenue provides natural hedge against rupee depreciation

🏢 **Top Picks:**
• TCS (₹3,890): Strong client base, consistent performer
• Infosys (₹1,816): Digital transformation leader
• HCL Tech (₹1,679): Good value pick with growth potential

⚠️ **Considerations:**
• Monitor US market conditions (major revenue source)
• Currency fluctuations impact profitability
• Competition from global tech giants

💡 **Investment Strategy:**
• Consider gradual accumulation on market dips
• Mix of large-cap (TCS, Infosys) and mid-cap IT stocks
• Target 15-20% portfolio allocation to IT sector`;

      suggestions = ['Best IT stocks to buy?', 'IT sector risks?', 'When to sell IT stocks?'];
    } else if (lowerMessage.includes('gold')) {
      response = `Gold Investment Analysis:

💰 **Current Gold Prices:**
• 24K Gold: ₹74,500/10gm (+0.8%)
• 22K Gold: ₹68,300/10gm (+0.8%)

📊 **Investment Case:**
• Excellent hedge against inflation and currency devaluation
• Negative correlation with equity markets
• Cultural preference in India provides support

🎯 **Allocation Recommendation:**
• 5-10% of portfolio in gold (optimal range)
• Digital Gold or Gold ETFs for convenience
• Physical gold for long-term wealth preservation

⏰ **Timing:**
• Current levels reasonable for accumulation
• Dollar-cost averaging through SIP in Gold ETFs
• Avoid timing the market, maintain steady allocation`;

      suggestions = ['Gold ETF vs Physical Gold?', 'Best time to buy gold?', 'Gold vs Silver investment?'];
    } else if (lowerMessage.includes('diversify') || lowerMessage.includes('diversification')) {
      response = `Portfolio Diversification Guide:

🎯 **Optimal Asset Allocation:**
• Large Cap Stocks: 50-60% (stability)
• Mid Cap Stocks: 20-25% (growth)
• Small Cap Stocks: 5-10% (high growth potential)
• Gold: 5-10% (hedge)
• Debt/Fixed Deposits: 5-15% (safety)

🏭 **Sector Distribution:**
• Financial Services: 20-25%
• Information Technology: 15-20%
• Consumer Goods: 10-15%
• Healthcare/Pharma: 8-12%
• Energy/Oil & Gas: 5-10%
• Others: 15-20%

📈 **Geographic Diversification:**
• 70-80% Indian equities
• 15-20% International exposure (US, Emerging markets)
• 5-10% Alternative investments

🔄 **Rebalancing:**
• Review allocation quarterly
• Rebalance when allocation deviates >5%
• Use SIP for automatic diversification`;

      suggestions = ['International investing options?', 'How often to rebalance?', 'Best diversification tools?'];
    } else {
      response = `I understand you're looking for investment guidance. Here are some general insights:

📊 **Market Overview:**
• Indian markets showing resilience with NIFTY at 24,619
• Banking and IT sectors leading the rally
• Monsoon and festive season supporting consumption

💡 **General Investment Principles:**
• Start early and invest regularly
• Diversify across sectors and market caps
• Maintain emergency fund (6 months expenses)
• Review and rebalance portfolio quarterly

🎯 **For Personalized Advice:**
Please specify your query - portfolio analysis, sector recommendations, stock picks, or investment strategy.`;

      suggestions = ['Analyze my portfolio', 'Best sectors now?', 'Investment strategy for beginners'];
    }

    return {
      type: 'bot',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Investment Advisor</h2>
        <p className="text-gray-600">Get personalized investment advice powered by artificial intelligence</p>
      </div>

      {/* Quick Questions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((question, index) => {
            const IconComponent = question.icon;
            return (
              <button
                key={index}
                onClick={() => sendMessage(question.text)}
                className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <div className="bg-blue-600 p-2 rounded-lg">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-800 font-medium">{question.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {message.type === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-line">{message.content}</div>
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-600">Suggested follow-ups:</p>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(suggestion)}
                          className="block w-full text-left text-sm bg-white p-2 rounded border hover:bg-gray-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your investments..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAdvisorTab;
