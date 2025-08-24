import axios from 'axios';
import { PriceData,Asset } from '../models/investment.model.js';

class MarketDataService {
    constructor() {
        // Working Indian APIs with INR base
        this.ibjaApiKey = process.env.IBJA_API_KEY; // IBJA Gold & Silver (India)
        this.goldApiKey = process.env.GOLD_PRICE_API_KEY; // GoldPriceAPI India
        this.zerodhaApiKey = process.env.ZERODHA_API_KEY; // Zerodha Kite Connect
        this.trueDataApiKey = process.env.TRUE_DATA_API_KEY; // TrueData API
        this.upstoxApiKey = process.env.UPSTOX_API_KEY; // Upstox API
    }

    // Method 1: Using IBJA API (India Bullion and Jewellers Association)
    async fetchPreciousMetalsDataIBJA() {
        try {
            const response = await axios.get('https://api.indiagoldratesapi.com/v1/rates', {
                params: {
                    api_key: this.ibjaApiKey,
                    format: 'json'
                },
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = response.data;
            const priceUpdates = [];

            // IBJA provides rates in INR per gram
            if (data.success) {
                // Gold prices for different purities
                const goldRates = data.rates.gold;
                const silverRates = data.rates.silver;

                // Add Gold 24K
                if (goldRates['999']) {
                    priceUpdates.push(new PriceData({
                        symbol: 'GOLD-24K',
                        price: goldRates['999'].am, // Morning rate
                        high: goldRates['999'].pm,
                        low: goldRates['999'].am,
                        bid: goldRates['999'].am * 0.995,
                        ask: goldRates['999'].am * 1.005,
                        changePercent: 0,
                        changeAmount: 0,
                        marketStatus: 'OPEN',
                        currency: 'INR',
                        unit: 'per_gram'
                    }));
                }

                // Add Gold 22K
                if (goldRates['916']) {
                    priceUpdates.push(new PriceData({
                        symbol: 'GOLD-22K',
                        price: goldRates['916'].am,
                        high: goldRates['916'].pm,
                        low: goldRates['916'].am,
                        bid: goldRates['916'].am * 0.995,
                        ask: goldRates['916'].am * 1.005,
                        changePercent: 0,
                        changeAmount: 0,
                        marketStatus: 'OPEN',
                        currency: 'INR',
                        unit: 'per_gram'
                    }));
                }

                // Add Silver
                if (silverRates['999']) {
                    priceUpdates.push(new PriceData({
                        symbol: 'SILVER',
                        price: silverRates['999'].am,
                        high: silverRates['999'].pm,
                        low: silverRates['999'].am,
                        bid: silverRates['999'].am * 0.995,
                        ask: silverRates['999'].am * 1.005,
                        changePercent: 0,
                        changeAmount: 0,
                        marketStatus: 'OPEN',
                        currency: 'INR',
                        unit: 'per_gram'
                    }));
                }
            }

            await PriceData.insertMany(priceUpdates);
            return priceUpdates;

        } catch (error) {
            console.error('Error fetching IBJA metals data:', error);
            // Fallback to alternative metals API
            return await this.fetchPreciousMetalsDataAlternative();
        }
    }

    // Alternative: GoldPriceAPI India (Free & Working)
    async fetchPreciousMetalsDataAlternative() {
        try {
            const response = await axios.get('https://api.gold-price-api-india.pages.dev/api/rates', {
                timeout: 10000
            });

            const data = response.data;
            const priceUpdates = [];

            if (data.success) {
                // This API provides city-wise gold rates in INR
                const mumbaiRates = data.rates.Mumbai || data.rates.Delhi;

                if (mumbaiRates) {
                    // Gold 24K
                    priceUpdates.push(new PriceData({
                        symbol: 'GOLD-24K',
                        price: mumbaiRates.gold_24k / 10, // Convert from per 10g to per gram
                        changePercent: mumbaiRates.gold_24k_change || 0,
                        changeAmount: 0,
                        marketStatus: 'OPEN',
                        currency: 'INR',
                        unit: 'per_gram'
                    }));

                    // Gold 22K
                    priceUpdates.push(new PriceData({
                        symbol: 'GOLD-22K',
                        price: mumbaiRates.gold_22k / 10,
                        changePercent: mumbaiRates.gold_22k_change || 0,
                        changeAmount: 0,
                        marketStatus: 'OPEN',
                        currency: 'INR',
                        unit: 'per_gram'
                    }));

                    // Silver
                    if (mumbaiRates.silver) {
                        priceUpdates.push(new PriceData({
                            symbol: 'SILVER',
                            price: mumbaiRates.silver,
                            changePercent: mumbaiRates.silver_change || 0,
                            changeAmount: 0,
                            marketStatus: 'OPEN',
                            currency: 'INR',
                            unit: 'per_gram'
                        }));
                    }
                }
            }

            return priceUpdates;

        } catch (error) {
            console.error('Error fetching alternative metals data:', error);
            throw error;
        }
    }

    // Method 2: Free NSE Data Scraping (No API Key Required)
    async fetchStockDataNSE(symbols) {
        try {
            const priceUpdates = [];

            for (const symbol of symbols) {
                try {
                    // Using NSE's public endpoint (no auth required)
                    const response = await axios.get(`https://www.nseindia.com/api/quote-equity?symbol=${symbol}`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br'
                        },
                        timeout: 10000
                    });

                    const data = response.data;
                    if (data && data.priceInfo) {
                        const priceInfo = data.priceInfo;
                        
                        priceUpdates.push(new PriceData({
                            symbol: symbol,
                            price: priceInfo.lastPrice,
                            high: priceInfo.intraDayHighLow?.max || priceInfo.lastPrice,
                            low: priceInfo.intraDayHighLow?.min || priceInfo.lastPrice,
                            open: priceInfo.open,
                            close: priceInfo.close,
                            volume: data.marketDeptOrderBook?.totalTradedVolume || 0,
                            changeAmount: priceInfo.change,
                            changePercent: priceInfo.pChange,
                            marketStatus: 'OPEN',
                            currency: 'INR'
                        }));
                    }

                } catch (symbolError) {
                    console.error(`Error fetching NSE data for ${symbol}:`, symbolError);
                    // Try Yahoo Finance as backup
                    await this.fetchStockDataYahoo(symbol, priceUpdates);
                }

                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (priceUpdates.length > 0) {
                await PriceData.insertMany(priceUpdates);
            }

            return priceUpdates;

        } catch (error) {
            console.error('Error fetching NSE stock data:', error);
            throw error;
        }
    }

    // Backup: Yahoo Finance for Indian Stocks
    async fetchStockDataYahoo(symbol, priceUpdates) {
        try {
            // Add .NS suffix for NSE stocks on Yahoo Finance
            const yahooSymbol = `${symbol}.NS`;
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
                timeout: 10000
            });

            const data = response.data;
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const quote = result.indicators.quote[0];
                const meta = result.meta;

                if (quote && meta) {
                    priceUpdates.push(new PriceData({
                        symbol: symbol,
                        price: meta.regularMarketPrice,
                        high: quote.high[quote.high.length - 1],
                        low: quote.low[quote.low.length - 1],
                        open: quote.open[quote.open.length - 1],
                        close: meta.previousClose,
                        volume: quote.volume[quote.volume.length - 1],
                        changeAmount: meta.regularMarketPrice - meta.previousClose,
                        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                        marketStatus: 'OPEN',
                        currency: 'INR'
                    }));
                }
            }
        } catch (error) {
            console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
        }
    }

    // Method 3: Using Groww API (Reliable Indian Broker)
    async fetchStockDataGroww(symbols) {
        try {
            const priceUpdates = [];

            // Groww's public API endpoints (some don't require auth)
            for (const symbol of symbols) {
                try {
                    const response = await axios.get(`https://groww.in/v1/api/search/v1/entity/STOCKS/${symbol}`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        },
                        timeout: 10000
                    });

                    const data = response.data;
                    if (data && data.content && data.content[0]) {
                        const stock = data.content[0];
                        
                        // Get detailed quote
                        const quoteResponse = await axios.get(`https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/NSE/segment/CASH/${symbol}`, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        const quote = quoteResponse.data;
                        if (quote && quote.ltp) {
                            priceUpdates.push(new PriceData({
                                symbol: symbol,
                                price: quote.ltp,
                                high: quote.high,
                                low: quote.low,
                                open: quote.open,
                                close: quote.close,
                                volume: quote.volume,
                                changeAmount: quote.dayChange,
                                changePercent: quote.dayChangePerc,
                                marketStatus: 'OPEN',
                                currency: 'INR'
                            }));
                        }
                    }
                } catch (symbolError) {
                    console.error(`Error fetching Groww data for ${symbol}:`, symbolError);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (priceUpdates.length > 0) {
                await PriceData.insertMany(priceUpdates);
            }

            return priceUpdates;

        } catch (error) {
            console.error('Error fetching Groww stock data:', error);
            throw error;
        }
    }

    // Combined method that tries multiple sources
    async fetchStockData(symbols) {
        console.log('Fetching Indian stock data for symbols:', symbols);
        
        try {
            // Try NSE first (most reliable for Indian stocks)
            const nseData = await this.fetchStockDataNSE(symbols);
            if (nseData.length > 0) {
                return nseData;
            }
        } catch (error) {
            console.log('NSE failed, trying Groww...');
        }

        try {
            // Try Groww as backup
            return await this.fetchStockDataGroww(symbols);
        } catch (error) {
            console.log('Groww failed, using Yahoo Finance...');
            
            // Final fallback: Yahoo Finance
            const priceUpdates = [];
            for (const symbol of symbols) {
                await this.fetchStockDataYahoo(symbol, priceUpdates);
            }
            
            if (priceUpdates.length > 0) {
                await PriceData.insertMany(priceUpdates);
            }
            
            return priceUpdates;
        }
    }

    // Combined precious metals method
    async fetchPreciousMetalsData() {
        try {
            // Try IBJA API first
            return await this.fetchPreciousMetalsDataIBJA();
        } catch (error) {
            console.log('IBJA failed, trying alternative...');
            return await this.fetchPreciousMetalsDataAlternative();
        }
    }

    // Rest of your existing methods remain the same...
    async getLatestPrices(symbols) {
        try {
            const latestPrices = await PriceData.aggregate([
                { 
                    $match: { 
                        symbol: { $in: symbols } 
                    } 
                },
                { 
                    $sort: { 
                        createdAt: -1
                    } 
                },
                {
                    $group: {
                        _id: '$symbol',
                        latestPrice: { $first: '$$ROOT' }
                    }
                }
            ]);

            return latestPrices.map(item => item.latestPrice);

        } catch (error) {
            console.error('Error getting latest prices:', error);
            throw error;
        }
    }

    async getHistoricalData(symbol, period = '1D') {
        try {
            const timeframes = {
                '1D': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                '1W': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                '1M': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                '3M': { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
                '1Y': { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
            };

            const data = await PriceData.find({
                symbol: symbol,
                createdAt: timeframes[period]
            }).sort({ createdAt: 1 });

            return data;

        } catch (error) {
            console.error('Error getting historical data:', error);
            throw error;
        }
    }

    // Test method to verify APIs
    async testAllAPIs() {
        const results = {
            metals: { ibja: false, alternative: false },
            stocks: { nse: false, groww: false, yahoo: false },
            errors: []
        };

        // Test metals APIs
        try {
            await this.fetchPreciousMetalsDataIBJA();
            results.metals.ibja = true;
        } catch (error) {
            results.errors.push(`IBJA Metals API: ${error.message}`);
        }

        try {
            await this.fetchPreciousMetalsDataAlternative();
            results.metals.alternative = true;
        } catch (error) {
            results.errors.push(`Alternative Metals API: ${error.message}`);
        }

        // Test stock APIs
        try {
            await this.fetchStockDataNSE(['RELIANCE']);
            results.stocks.nse = true;
        } catch (error) {
            results.errors.push(`NSE API: ${error.message}`);
        }

        try {
            await this.fetchStockDataGroww(['RELIANCE']);
            results.stocks.groww = true;
        } catch (error) {
            results.errors.push(`Groww API: ${error.message}`);
        }

        return results;
    }
}

export default MarketDataService;
