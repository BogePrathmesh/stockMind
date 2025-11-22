# New Features Setup Guide

This document describes the new advanced features added to StockMind.

## 🎯 Features Added

### 1. Portfolio Tracker + Live P&L
- Add stocks with quantity and buy price
- Real-time profit/loss tracking
- Overall portfolio value, daily P&L
- Best/worst performer identification
- Portfolio value over time graph

### 2. Price Alerts
- Set alerts for price movements
- Support for:
  - Price above/below thresholds
  - Price change percentage
  - Volume increase alerts
- Email notifications when alerts trigger
- Automatic checking every 5 minutes

### 3. Sentiment Analysis on News
- AI-powered sentiment analysis using NLP
- Fetches and analyzes company news
- Shows sentiment score (Positive/Neutral/Negative)
- Overall sentiment summary

### 4. Strategy Backtesting
- Test trading strategies on historical data
- Supported strategies:
  - Moving Average Crossover (50MA vs 200MA)
  - RSI-based signals (Oversold/Overbought)
- Shows:
  - Return percentage
  - Win/Loss ratio
  - Max drawdown
  - Equity curve graph

### 5. Advanced Interactive Charts
- TradingView-style charts using lightweight-charts
- Candlestick charts with volume
- Real-time price visualization

### 6. Real-time Chatbot
- Bottom-right corner chatbot
- Answers questions about:
  - Portfolio tracking
  - Price alerts
  - Sentiment analysis
  - Strategy backtesting
  - Chart features

## 📦 Installation

### Backend Dependencies

```bash
cd backend
npm install
```

New dependencies added:
- `axios` - For stock data API calls
- `natural` - For NLP sentiment analysis
- `node-cron` - For scheduled alert checking

### Frontend Dependencies

```bash
cd frontend
npm install
```

New dependencies added:
- `lightweight-charts` - For TradingView-style charts

## 🗄️ Database Migration

Run Prisma migration to add new models:

```bash
cd backend
npm run prisma:migrate
```

This will create the following new models:
- `Portfolio` - User portfolio data
- `StockHolding` - Individual stock holdings
- `PortfolioHistory` - Historical portfolio values
- `PriceAlert` - User price alerts
- `NewsSentiment` - News sentiment analysis data
- `BacktestStrategy` - Strategy backtest results

## 🔧 Configuration

### Stock Data API

The stock data service uses mock data by default. To use real stock data:

1. Get an API key from a stock data provider (e.g., Alpha Vantage, Yahoo Finance)
2. Add to `backend/.env`:
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

3. Update `backend/src/services/stockData.service.js` to use the real API

### Email Notifications

Price alerts send email notifications. Configure email in `backend/.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🚀 Usage

### Portfolio Tracker
1. Navigate to **Portfolio** in the sidebar
2. Click **Add Stock** to add holdings
3. Enter symbol, name, quantity, and buy price
4. View real-time P&L and portfolio value

### Price Alerts
1. Navigate to **Price Alerts**
2. Click **Create Alert**
3. Select alert type and set conditions
4. Receive email notifications when alerts trigger

### Sentiment Analysis
1. Navigate to **Sentiment Analysis**
2. Enter a stock symbol
3. View sentiment analysis of recent news

### Strategy Backtesting
1. Navigate to **Backtest Strategy**
2. Click **Run Backtest**
3. Configure strategy parameters
4. View backtest results with equity curve

### Chatbot
1. Click the chat icon in the bottom-right corner
2. Ask questions about features
3. Get instant help and suggestions

## 📊 API Endpoints

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/holdings` - Add stock holding
- `PUT /api/portfolio/holdings/:id` - Update holding
- `DELETE /api/portfolio/holdings/:id` - Delete holding
- `GET /api/portfolio/history` - Get portfolio history

### Alerts
- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Sentiment
- `GET /api/sentiment/:symbol` - Get sentiment analysis
- `GET /api/sentiment/:symbol/history` - Get sentiment history

### Backtest
- `GET /api/backtest` - Get user backtests
- `POST /api/backtest` - Run backtest
- `GET /api/backtest/:id` - Get backtest details
- `DELETE /api/backtest/:id` - Delete backtest

### Chatbot
- `POST /api/chatbot/message` - Send chat message

## 🔄 Real-time Updates

- Portfolio prices update every 30 seconds
- Price alerts checked every 5 minutes via cron job
- Chatbot provides instant responses

## 📝 Notes

- Stock data is currently using mock data for demonstration
- Replace with real API integration for production use
- Sentiment analysis uses simple NLP - consider upgrading for production
- Backtesting uses simplified indicators - can be extended with more strategies

## 🐛 Troubleshooting

1. **Migration errors**: Make sure MongoDB is running and DATABASE_URL is correct
2. **Chart not loading**: Check browser console for errors, ensure lightweight-charts is installed
3. **Alerts not triggering**: Check cron job is running, verify email configuration
4. **Sentiment analysis failing**: Ensure `natural` package is installed correctly

## 🎨 UI Features

- Dark mode support
- Responsive design
- Real-time data updates
- Interactive charts
- Modern, clean interface

Enjoy your enhanced StockMind application! 🚀

