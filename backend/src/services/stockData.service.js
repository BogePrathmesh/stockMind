import axios from 'axios';

// Real-time stock data APIs
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const USE_REAL_DATA = process.env.USE_REAL_STOCK_DATA !== 'false'; // Default to true

// Cache to avoid rate limits
const priceCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Get stock price from Yahoo Finance (free, no API key needed)
const getYahooFinancePrice = async (symbol) => {
  try {
    // Yahoo Finance API endpoint (free, no authentication)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.data?.chart?.result?.[0]) {
      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      if (meta && quote) {
        const currentPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.previousClose || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(currentPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh || currentPrice,
          low: meta.regularMarketDayLow || currentPrice,
          open: meta.regularMarketOpen || previousClose,
          previousClose: parseFloat(previousClose.toFixed(2)),
          timestamp: new Date().toISOString()
        };
      }
    }
    throw new Error('Invalid response from Yahoo Finance');
  } catch (error) {
    console.error('Yahoo Finance API error:', error.message);
    throw error;
  }
};

// Get stock price from Alpha Vantage
const getAlphaVantagePrice = async (symbol) => {
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    throw new Error('Alpha Vantage API key not configured');
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY
      },
      timeout: 5000
    });

    if (response.data['Global Quote']) {
      const quote = response.data['Global Quote'];
      const price = parseFloat(quote['05. price']);
      const previousClose = parseFloat(quote['08. previous close']);
      const change = price - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: parseInt(quote['06. volume'] || 0),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(previousClose.toFixed(2)),
        timestamp: new Date().toISOString()
      };
    }
    throw new Error('Invalid response from Alpha Vantage');
  } catch (error) {
    console.error('Alpha Vantage API error:', error.message);
    throw error;
  }
};

// Get stock price from Finnhub
const getFinnhubPrice = async (symbol) => {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key not configured');
  }

  try {
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      },
      timeout: 5000
    });

    if (response.data && response.data.c) {
      const data = response.data;
      const price = data.c;
      const previousClose = data.pc || price;
      const change = price - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: data.v || 0,
        high: data.h || price,
        low: data.l || price,
        open: data.o || previousClose,
        previousClose: parseFloat(previousClose.toFixed(2)),
        timestamp: new Date().toISOString()
      };
    }
    throw new Error('Invalid response from Finnhub');
  } catch (error) {
    console.error('Finnhub API error:', error.message);
    throw error;
  }
};

// Main function to get stock price with fallbacks
export const getStockPrice = async (symbol) => {
  try {
    // Check cache first
    const cacheKey = symbol.toUpperCase();
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    if (!USE_REAL_DATA) {
      // Fallback to mock data if real data is disabled
      return getMockPrice(symbol);
    }

    // Try multiple APIs in order of preference
    const apis = [
      () => getYahooFinancePrice(symbol), // Free, no API key needed
      () => getAlphaVantagePrice(symbol),
      () => getFinnhubPrice(symbol)
    ];

    for (const apiCall of apis) {
      try {
        const result = await apiCall();
        // Cache the result
        priceCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        return result;
      } catch (error) {
        console.warn(`API failed, trying next: ${error.message}`);
        continue;
      }
    }

    // If all APIs fail, use mock data
    console.warn(`All APIs failed for ${symbol}, using mock data`);
    return getMockPrice(symbol);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    // Fallback to mock data on error
    return getMockPrice(symbol);
  }
};

// Mock data fallback
const getMockPrice = (symbol) => {
  const mockPrice = 1000 + Math.random() * 500;
  const mockChange = (Math.random() - 0.5) * 100;
  
  return {
    symbol: symbol.toUpperCase(),
    price: parseFloat(mockPrice.toFixed(2)),
    change: parseFloat(mockChange.toFixed(2)),
    changePercent: parseFloat(((mockChange / mockPrice) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 1000000),
    high: parseFloat((mockPrice + Math.random() * 50).toFixed(2)),
    low: parseFloat((mockPrice - Math.random() * 50).toFixed(2)),
    open: parseFloat((mockPrice + mockChange).toFixed(2)),
    previousClose: parseFloat((mockPrice - mockChange).toFixed(2)),
    timestamp: new Date().toISOString()
  };
};

export const getMultipleStockPrices = async (symbols) => {
  try {
    const prices = await Promise.all(
      symbols.map(symbol => getStockPrice(symbol))
    );
    return prices;
  } catch (error) {
    console.error('Error fetching multiple stock prices:', error);
    throw new Error('Failed to fetch stock prices');
  }
};

export const getHistoricalData = async (symbol, days = 30) => {
  try {
    if (!USE_REAL_DATA) {
      return getMockHistoricalData(symbol, days);
    }

    // Try to get real historical data from Yahoo Finance
    try {
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - (days * 24 * 60 * 60);
      
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`;
      const response = await axios.get(url, {
        params: {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (response.data?.chart?.result?.[0]) {
        const result = response.data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];
        
        if (quote && timestamps.length > 0) {
          const data = [];
          for (let i = 0; i < timestamps.length; i++) {
            const date = new Date(timestamps[i] * 1000);
            data.push({
              date: date.toISOString().split('T')[0],
              open: parseFloat((quote.open[i] || 0).toFixed(2)),
              high: parseFloat((quote.high[i] || 0).toFixed(2)),
              low: parseFloat((quote.low[i] || 0).toFixed(2)),
              close: parseFloat((quote.close[i] || 0).toFixed(2)),
              volume: quote.volume[i] || 0
            });
          }
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real historical data, using mock:', error.message);
    }

    // Fallback to mock data
    return getMockHistoricalData(symbol, days);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return getMockHistoricalData(symbol, days);
  }
};

// Mock historical data fallback
const getMockHistoricalData = (symbol, days) => {
  const data = [];
  const basePrice = 1000;
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    currentPrice += (Math.random() - 0.5) * 20;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat((currentPrice + (Math.random() - 0.5) * 10).toFixed(2)),
      high: parseFloat((currentPrice + Math.random() * 30).toFixed(2)),
      low: parseFloat((currentPrice - Math.random() * 30).toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
};

export const getStockNews = async (symbol) => {
  try {
    // Try to get real news from NewsAPI or similar
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (NEWS_API_KEY && USE_REAL_DATA) {
      try {
        // Using NewsAPI (free tier available)
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: symbol,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: NEWS_API_KEY
          },
          timeout: 5000
        });

        if (response.data?.articles) {
          return response.data.articles.map(article => ({
            title: article.title,
            content: article.description || article.content?.substring(0, 200) || '',
            source: article.source?.name || 'Unknown',
            url: article.url,
            publishedAt: article.publishedAt
          }));
        }
      } catch (error) {
        console.warn('NewsAPI failed, using mock news:', error.message);
      }
    }

    // Fallback to mock news
    return getMockNews(symbol);
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return getMockNews(symbol);
  }
};

// Mock news fallback
const getMockNews = (symbol) => {
  return [
    {
      title: `${symbol} Reports Strong Quarterly Earnings`,
      content: `The company reported better-than-expected earnings for the quarter, driven by strong demand in key markets.`,
      source: 'Financial Times',
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `${symbol} Announces New Product Launch`,
      content: `The company has announced the launch of a new product line expected to boost revenue in the coming quarters.`,
      source: 'Business Standard',
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `Analysts Upgrade ${symbol} Price Target`,
      content: `Several analysts have upgraded their price targets for the stock, citing strong fundamentals.`,
      source: 'Economic Times',
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

