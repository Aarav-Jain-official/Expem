import express from 'express';
import https from 'https';
import OpenAI from 'openai';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: { error: 'Too many AI requests, try again later' }
});

// Utility function for robust HTTP requests
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// NSE Stocks - Using Yahoo Finance (More Reliable)
router.get('/nse/stocks', async (req, res) => {
  try {
    const cacheKey = 'nse-stocks';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Top NSE stocks with Yahoo Finance symbols
    const stocks = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
      'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS'
    ];

    const stockData = await Promise.allSettled(
      stocks.map(async (symbol) => {
        const data = await fetchWithRetry(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        );
        
        const result = data.chart?.result?.[0];
        if (!result) throw new Error('Invalid data structure');

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = ((currentPrice - previousClose) / previousClose) * 100;

        return {
          symbol: symbol.replace('.NS', ''),
          name: meta.longName || symbol.replace('.NS', ''),
          price: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          volume: meta.regularMarketVolume || 0,
          marketCap: meta.marketCap || null,
          sector: getSectorFromSymbol(symbol.replace('.NS', ''))
        };
      })
    );

    const validStocks = stockData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (validStocks.length === 0) {
      return res.status(503).json({ error: 'No stock data available' });
    }

    cache.set(cacheKey, validStocks);
    res.json(validStocks);

  } catch (error) {
    console.error('NSE stocks error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      message: error.message 
    });
  }
});

// Market Indices - Multiple sources with fallback
router.get('/indices', async (req, res) => {
  try {
    const cacheKey = 'market-indices';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const indices = {
      '^NSEI': 'NIFTY',
      '^BSESN': 'SENSEX', 
      '^NSEBANK': 'BANKNIFTY',
      '^NSMIDCP': 'MIDCAP',
      '^CNXIT': 'IT'
    };

    const indicesData = await Promise.allSettled(
      Object.entries(indices).map(async ([symbol, name]) => {
        const data = await fetchWithRetry(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        );

        const result = data.chart?.result?.[0];
        if (!result) throw new Error('Invalid data');

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = ((currentPrice - previousClose) / previousClose) * 100;

        return {
          name,
          value: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow
        };
      })
    );

    const validIndices = {};
    indicesData
      .filter(result => result.status === 'fulfilled')
      .forEach(result => {
        const data = result.value;
        validIndices[data.name] = {
          value: data.value,
          change: data.change,
          high: data.high,
          low: data.low
        };
      });

    if (Object.keys(validIndices).length === 0) {
      return res.status(503).json({ error: 'No indices data available' });
    }

    cache.set(cacheKey, validIndices);
    res.json(validIndices);

  } catch (error) {
    console.error('Indices error:', error);
    res.status(500).json({ error: 'Failed to fetch indices data' });
  }
});

// Gold Prices - Indian market focused
router.get('/gold-prices', async (req, res) => {
  try {
    const cacheKey = 'gold-prices';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Try multiple sources
    let goldData;
    
    try {
      // Primary: Gold API (requires API key)
      if (process.env.GOLD_API_KEY) {
        goldData = await fetchWithRetry(
          'https://api.goldapi.io/api/XAU/INR',
          {
            headers: {
              'x-access-token': process.env.GOLD_API_KEY
            }
          }
        );
      } else {
        throw new Error('No Gold API key');
      }
    } catch (error) {
      // Fallback: MetalPriceAPI
      try {
        const [goldResponse, exchangeResponse] = await Promise.all([
          fetchWithRetry('https://api.metalpriceapi.com/v1/latest?api_key=' + process.env.METAL_API_KEY + '&base=USD&currencies=XAU'),
          fetchWithRetry('https://api.exchangerate-api.com/v4/latest/USD')
        ]);

        const goldPriceUsd = 1 / goldResponse.rates.XAU; // Price per ounce in USD
        const usdToInr = exchangeResponse.rates.INR;
        const goldPriceInr = goldPriceUsd * usdToInr;

        goldData = {
          price_gram_24k: goldPriceInr / 31.1035, // Convert ounce to gram
          price_gram_22k: (goldPriceInr / 31.1035) * 0.916,
          price_gram_18k: (goldPriceInr / 31.1035) * 0.75
        };
      } catch (fallbackError) {
        throw new Error('All gold price sources failed');
      }
    }

    const processedData = {
      "24K": { 
        price: Math.round(goldData.price_gram_24k * 10), // per 10 grams
        unit: "per 10 grams",
        change: goldData.ch || 0
      },
      "22K": { 
        price: Math.round((goldData.price_gram_22k || goldData.price_gram_24k * 0.916) * 10),
        unit: "per 10 grams",
        change: goldData.ch || 0
      },
      "18K": { 
        price: Math.round((goldData.price_gram_18k || goldData.price_gram_24k * 0.75) * 10),
        unit: "per 10 grams", 
        change: goldData.ch || 0
      },
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, processedData);
    res.json(processedData);

  } catch (error) {
    console.error('Gold prices error:', error);
    res.status(500).json({ error: 'Failed to fetch gold prices' });
  }
});

// Mutual Funds - Using reliable MF API
router.get('/mutual-funds', async (req, res) => {
  try {
    const cacheKey = 'mutual-funds';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Get scheme list first
    const schemes = await fetchWithRetry('https://api.mfapi.in/mf');
    
    // Get top performing large cap and mid cap funds
    const topSchemes = schemes.filter(scheme => 
      scheme.schemeName.toLowerCase().includes('large cap') ||
      scheme.schemeName.toLowerCase().includes('flexi cap') ||
      scheme.schemeName.toLowerCase().includes('mid cap')
    ).slice(0, 15);

    const fundsData = await Promise.allSettled(
      topSchemes.map(async (scheme) => {
        const navData = await fetchWithRetry(`https://api.mfapi.in/mf/${scheme.schemeCode}`);
        const latestNav = navData.data[0];
        
        // Calculate returns (simplified)
        const oneMonthAgo = navData.data[Math.min(21, navData.data.length - 1)]; // ~1 month
        const returns = oneMonthAgo ? 
          (((parseFloat(latestNav.nav) - parseFloat(oneMonthAgo.nav)) / parseFloat(oneMonthAgo.nav)) * 100).toFixed(2) : 
          'N/A';

        return {
          name: scheme.schemeName,
          code: scheme.schemeCode,
          nav: parseFloat(latestNav.nav),
          date: latestNav.date,
          returns: returns + '%',
          category: getFundCategory(scheme.schemeName),
          fundHouse: getFundHouse(scheme.schemeName)
        };
      })
    );

    const validFunds = fundsData
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(fund => fund.nav > 0);

    cache.set(cacheKey, validFunds);
    res.json(validFunds);

  } catch (error) {
    console.error('Mutual funds error:', error);
    res.status(500).json({ error: 'Failed to fetch mutual funds data' });
  }
});

// AI Investment Advice with enhanced context
router.post('/ai/investment-advice', aiLimiter, async (req, res) => {
  try {
    const { message, portfolio = [], marketData = {}, context = {} } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get current market data for context
    const [currentStocks, currentIndices] = await Promise.all([
      cache.get('nse-stocks') || [],
      cache.get('market-indices') || {}
    ]);

    const portfolioAnalysis = analyzePortfolio(portfolio);
    
    const systemPrompt = `You are an expert Indian financial advisor with deep knowledge of NSE, BSE, and Indian mutual funds.

CURRENT MARKET DATA:
- NIFTY: ${currentIndices.NIFTY?.value || 'N/A'} (${currentIndices.NIFTY?.change || 0}%)
- SENSEX: ${currentIndices.SENSEX?.value || 'N/A'} (${currentIndices.SENSEX?.change || 0}%)
- BANK NIFTY: ${currentIndices.BANKNIFTY?.value || 'N/A'} (${currentIndices.BANKNIFTY?.change || 0}%)

USER PORTFOLIO:
${portfolioAnalysis.summary}
Total Value: ₹${portfolioAnalysis.totalValue?.toLocaleString('en-IN')}
Top Holdings: ${portfolioAnalysis.topHoldings}
Sector Allocation: ${portfolioAnalysis.sectors}

Provide specific, actionable advice considering:
1. Current Indian market conditions and trends
2. User's risk profile and portfolio composition  
3. Sector diversification opportunities
4. Tax implications (LTCG, STCG, equity vs debt funds)
5. Investment horizon and goals

Format response with clear sections using bullet points. Be specific about Indian stocks, sectors, and fund recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const advice = completion.choices[0].message.content;
    const suggestions = generateContextualSuggestions(message, portfolio, currentIndices);

    res.json({ 
      advice,
      suggestions,
      marketContext: {
        nifty: currentIndices.NIFTY,
        sensex: currentIndices.SENSEX,
        updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI advice error:', error);
    res.status(500).json({ error: 'Failed to generate investment advice' });
  }
});

// Get individual stock quote
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const yahooSymbol = `${symbol.toUpperCase()}.NS`;
    
    const data = await fetchWithRetry(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`
    );

    const result = data.chart?.result?.[0];
    if (!result) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;

    const stockInfo = {
      symbol: symbol.toUpperCase(),
      name: meta.longName || symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      historicalData: timestamps?.slice(-5).map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        close: quotes.close[quotes.close.length - 5 + index]
      })) || []
    };

    res.json(stockInfo);

  } catch (error) {
    console.error('Stock quote error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Helper Functions
function getSectorFromSymbol(symbol) {
  const sectorMap = {
    'RELIANCE': 'Oil & Gas',
    'TCS': 'IT Services', 
    'INFY': 'IT Services',
    'HDFCBANK': 'Banking',
    'SBIN': 'Banking',
    'ITC': 'FMCG',
    'HINDUNILVR': 'FMCG',
    'BHARTIARTL': 'Telecom',
    'KOTAKBANK': 'Banking',
    'LT': 'Infrastructure'
  };
  return sectorMap[symbol] || 'Others';
}

function getFundCategory(schemeName) {
  const name = schemeName.toLowerCase();
  if (name.includes('large cap')) return 'Large Cap';
  if (name.includes('mid cap')) return 'Mid Cap'; 
  if (name.includes('small cap')) return 'Small Cap';
  if (name.includes('flexi cap')) return 'Flexi Cap';
  if (name.includes('debt') || name.includes('income')) return 'Debt';
  return 'Equity';
}

function getFundHouse(schemeName) {
  const fundHouses = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Nippon', 'Franklin', 'Aditya Birla'];
  return fundHouses.find(house => schemeName.includes(house)) || 'Others';
}

function analyzePortfolio(portfolio) {
  if (!portfolio || portfolio.length === 0) {
    return {
      summary: 'No portfolio data available',
      totalValue: 0,
      topHoldings: 'None',
      sectors: 'Not diversified'
    };
  }

  const totalValue = portfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.currentPrice), 0);
    
  const topHoldings = portfolio
    .sort((a, b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice))
    .slice(0, 3)
    .map(h => h.symbol)
    .join(', ');

  const sectors = [...new Set(portfolio.map(h => getSectorFromSymbol(h.symbol)))].join(', ');

  return {
    summary: `Portfolio has ${portfolio.length} holdings`,
    totalValue,
    topHoldings,
    sectors
  };
}

function generateContextualSuggestions(message, portfolio, indices) {
  const msg = message.toLowerCase();
  
  if (msg.includes('portfolio') || msg.includes('analyze')) {
    return [
      'Should I rebalance my portfolio?',
      'Which sectors are overweight?',
      'Best stocks to add for diversification?'
    ];
  }
  
  if (msg.includes('market') || msg.includes('nifty') || msg.includes('sensex')) {
    return [
      'Is this a good time to invest?',
      'Market outlook for next quarter?',
      'Best defensive stocks now?'
    ];
  }
  
  if (msg.includes('mutual fund') || msg.includes('sip')) {
    return [
      'Best SIP amount for my salary?',
      'Large cap vs mid cap funds?',
      'Tax saving mutual fund options?'
    ];
  }
  
  return [
    'Analyze my risk profile',
    'Best investment strategy?',
    'How to start investing?'
  ];
}

export default router;
