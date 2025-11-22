# Real-Time Stock Data Setup Guide

## ✅ Real-Time Data Integration Complete!

Your StockMind application now uses **real-time stock data** from multiple sources with automatic fallbacks.

## 🔄 How It Works

### Data Sources (in order of preference):
1. **Yahoo Finance API** (Free, no API key needed) - Primary source
2. **Alpha Vantage** (Free tier available) - Fallback option
3. **Finnhub** (Free tier available) - Fallback option
4. **Mock Data** - Final fallback if all APIs fail

### Real-Time Features:
- ✅ **Live Stock Prices**: Updated every 30 seconds
- ✅ **WebSocket Updates**: Real-time price updates via Socket.IO
- ✅ **Portfolio Tracking**: Automatic P&L calculations with live prices
- ✅ **Price Alerts**: Checked every 5 minutes with real prices
- ✅ **Historical Data**: Real candlestick data for charts
- ✅ **News Feed**: Real news articles (with NewsAPI key)

## 🚀 Setup Instructions

### 1. Basic Setup (No API Keys Required)
The application works out of the box using **Yahoo Finance API** (free, no key needed).

Just start the server:
```bash
cd backend
npm run dev
```

### 2. Optional: Enhanced APIs (Recommended for Production)

#### Alpha Vantage (Free Tier)
1. Sign up at https://www.alphavantage.co/support/#api-key
2. Get your free API key
3. Add to `backend/.env`:
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

#### Finnhub (Free Tier)
1. Sign up at https://finnhub.io/register
2. Get your free API key
3. Add to `backend/.env`:
   ```
   FINNHUB_API_KEY=your_api_key_here
   ```

#### NewsAPI (For Real News)
1. Sign up at https://newsapi.org/register
2. Get your free API key
3. Add to `backend/.env`:
   ```
   NEWS_API_KEY=your_api_key_here
   ```

### 3. Environment Variables

Create or update `backend/.env`:
```env
# Stock Data APIs (Optional - works without these)
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here

# Enable/Disable Real Data (default: true)
USE_REAL_STOCK_DATA=true

# Database
DATABASE_URL=your_mongodb_url

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 📊 Real-Time Updates

### Portfolio Updates
- Prices update every **30 seconds** automatically
- WebSocket broadcasts updates to all connected clients
- Portfolio P&L recalculates in real-time

### Price Alerts
- Checked every **5 minutes** via cron job
- Uses real-time stock prices
- Sends email notifications when triggered

### WebSocket Events

**Client → Server:**
- `subscribe-stock`: Subscribe to stock price updates
- `subscribe-portfolio`: Subscribe to portfolio updates
- `unsubscribe-stock`: Unsubscribe from stock updates

**Server → Client:**
- `stock-price-update`: Real-time stock price update
- `portfolio-update`: Portfolio data update
- `notification`: User notifications

## 🔍 Testing Real-Time Data

### Test Stock Price API
```bash
# Get real-time price for a stock
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/stock/price/TCS
```

### Test Historical Data
```bash
# Get 30 days of historical data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/stock/history/TCS?days=30
```

## 📈 Supported Stock Symbols

### Indian Stocks (NSE)
- TCS (Tata Consultancy Services)
- RELIANCE (Reliance Industries)
- INFY (Infosys)
- HDFCBANK (HDFC Bank)
- ICICIBANK (ICICI Bank)
- And many more...

### International Stocks
- AAPL (Apple)
- GOOGL (Google)
- MSFT (Microsoft)
- TSLA (Tesla)
- And many more...

**Note**: Use the stock symbol as listed on the exchange (NSE for Indian stocks, NYSE/NASDAQ for US stocks).

## 🛠️ Troubleshooting

### Issue: Prices not updating
**Solution**: 
1. Check browser console for WebSocket connection
2. Verify server is running and Socket.IO is connected
3. Check network tab for API calls

### Issue: API rate limits
**Solution**:
1. Add API keys for multiple providers (Alpha Vantage, Finnhub)
2. The system automatically falls back to other APIs
3. Cache is implemented to reduce API calls (1 minute TTL)

### Issue: Yahoo Finance blocked
**Solution**:
1. Add Alpha Vantage or Finnhub API keys
2. The system will automatically use alternative APIs
3. Set `USE_REAL_STOCK_DATA=false` to use mock data temporarily

### Issue: Historical data not loading
**Solution**:
1. Check if symbol is valid
2. Verify API keys are set (if using Alpha Vantage/Finnhub)
3. System falls back to mock data if real data fails

## 🎯 Features Using Real-Time Data

1. **Portfolio Tracker**
   - Real-time stock prices
   - Live P&L calculations
   - Automatic updates every 30 seconds

2. **Price Alerts**
   - Real-time price monitoring
   - Email notifications
   - Multiple alert types

3. **Charts**
   - Real historical candlestick data
   - Interactive TradingView-style charts
   - Volume indicators

4. **Backtesting**
   - Real historical price data
   - Accurate strategy testing
   - Equity curve visualization

## 📝 Notes

- **Free Tier Limits**: 
  - Yahoo Finance: No official limits, but may throttle
  - Alpha Vantage: 5 API calls/minute, 500 calls/day
  - Finnhub: 60 API calls/minute (free tier)

- **Caching**: Prices are cached for 1 minute to reduce API calls

- **Fallback System**: If one API fails, the system automatically tries the next one

- **Mock Data**: Always available as final fallback for development

## 🚀 Production Recommendations

1. **Use Multiple API Keys**: Set up Alpha Vantage, Finnhub, and NewsAPI
2. **Monitor Rate Limits**: Implement proper rate limiting
3. **Use WebSocket**: Real-time updates reduce polling
4. **Cache Strategically**: Cache prices to reduce API calls
5. **Error Handling**: System gracefully handles API failures

Your application is now ready with **real-time stock data**! 🎉

