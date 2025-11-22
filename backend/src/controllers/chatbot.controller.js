// Enhanced chatbot controller for user queries and suggestions
export const chatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const lowerMessage = message.toLowerCase().trim();
    let response = '';
    
    // Portfolio queries
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings') || lowerMessage.includes('my stocks')) {
      if (lowerMessage.includes('add') || lowerMessage.includes('how to add')) {
        response = 'To add stocks to your portfolio:\n1. Go to the Portfolio section\n2. Click "Add Stock" button\n3. Enter stock symbol, name, quantity, and buy price\n4. Click "Add Stock" to save\n\nYour portfolio will automatically track real-time P&L!';
      } else if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
        response = 'To remove a stock from your portfolio:\n1. Go to the Portfolio section\n2. Find the stock in the holdings table\n3. Click "Remove" button\n4. Confirm the deletion';
      } else if (lowerMessage.includes('p&l') || lowerMessage.includes('profit') || lowerMessage.includes('loss')) {
        response = 'Your Portfolio shows:\n- Total P&L: Overall profit/loss across all holdings\n- Daily P&L: Today\'s change in portfolio value\n- Individual P&L: Profit/loss for each stock\n- Best/Worst Performers: Top gainers and losers\n\nAll values update in real-time!';
      } else {
        response = 'Your Portfolio section helps you:\n✅ Track all your stock holdings\n✅ See real-time profit/loss\n✅ View portfolio value over time\n✅ Identify best/worst performers\n\nGo to Portfolio in the sidebar to get started!';
      }
    }
    // Alert queries
    else if (lowerMessage.includes('alert') || lowerMessage.includes('notification') || lowerMessage.includes('notify')) {
      if (lowerMessage.includes('create') || lowerMessage.includes('set') || lowerMessage.includes('how to')) {
        response = 'To create a price alert:\n1. Go to Price Alerts section\n2. Click "Create Alert"\n3. Enter stock symbol\n4. Choose alert type:\n   - Price Above: Notify when price crosses above threshold\n   - Price Below: Notify when price drops below threshold\n   - Price Change %: Notify on percentage change\n5. Set your target value/percentage\n6. Click "Create Alert"\n\nYou\'ll receive email notifications when alerts trigger!';
      } else if (lowerMessage.includes('type') || lowerMessage.includes('kind')) {
        response = 'We support 4 types of alerts:\n1. Price Above - When stock crosses above a price\n2. Price Below - When stock drops below a price\n3. Price Change % - When price changes by a percentage\n4. Volume Increase - When trading volume increases\n\nAlerts are checked every 5 minutes automatically!';
      } else {
        response = 'Price Alerts help you:\n🔔 Get notified when stocks hit target prices\n📧 Receive email notifications\n⚡ Automatic checking every 5 minutes\n📊 Track all your alerts in one place\n\nGo to Price Alerts to set up your first alert!';
      }
    }
    // Sentiment analysis queries
    else if (lowerMessage.includes('sentiment') || lowerMessage.includes('news') || lowerMessage.includes('analysis')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('work')) {
        response = 'Sentiment Analysis works by:\n1. Fetching recent news articles for a stock\n2. Using AI/NLP to analyze the sentiment\n3. Classifying as Positive, Neutral, or Negative\n4. Providing an overall sentiment score\n\nThis helps you understand market perception of a stock!';
      } else if (lowerMessage.includes('use') || lowerMessage.includes('check')) {
        response = 'To analyze sentiment:\n1. Go to Sentiment Analysis section\n2. Enter a stock symbol (e.g., TCS, RELIANCE)\n3. Click "Analyze"\n4. View:\n   - Overall sentiment (Positive/Neutral/Negative)\n   - Sentiment score\n   - Individual news articles with their sentiment\n\nUse this to gauge market sentiment!';
      } else {
        response = 'Sentiment Analysis helps you:\n📰 Analyze news articles about stocks\n😊 Understand market sentiment (Positive/Neutral/Negative)\n📊 See sentiment scores and trends\n🔍 Make informed trading decisions\n\nCheck the Sentiment Analysis section to get started!';
      }
    }
    // Backtesting queries
    else if (lowerMessage.includes('backtest') || lowerMessage.includes('strategy') || lowerMessage.includes('test strategy')) {
      if (lowerMessage.includes('how') || lowerMessage.includes('run') || lowerMessage.includes('create')) {
        response = 'To run a backtest:\n1. Go to Backtest Strategy section\n2. Click "Run Backtest"\n3. Enter strategy name and stock symbol\n4. Choose buy/sell conditions:\n   - MA Crossover: 50MA vs 200MA\n   - RSI: Oversold (<30) or Overbought (>70)\n5. Set date range and initial capital\n6. Click "Run Backtest"\n\nView results including return %, win rate, and equity curve!';
      } else if (lowerMessage.includes('strategy') || lowerMessage.includes('type')) {
        response = 'Available strategies:\n1. Moving Average Crossover:\n   - Buy: 50MA > 200MA (Golden Cross)\n   - Sell: 50MA < 200MA (Death Cross)\n2. RSI Strategy:\n   - Buy: RSI < 30 (Oversold)\n   - Sell: RSI > 70 (Overbought)\n\nBacktests show return %, win rate, max drawdown, and equity curve!';
      } else {
        response = 'Backtesting helps you:\n📈 Test strategies on historical data\n💰 See potential returns and win rates\n📊 View equity curves\n🎯 Optimize your trading strategies\n\nTry the Backtest Strategy section to test your ideas!';
      }
    }
    // Chart queries
    else if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('candlestick')) {
      response = 'Our charts feature:\n📊 TradingView-style candlestick charts\n📈 Volume indicators\n🎨 Dark mode support\n⚡ Real-time price updates\n🔍 Interactive zoom and pan\n\nCharts are available in the Portfolio section and stock detail pages!';
    }
    // General help
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('features')) {
      response = 'I can help you with:\n\n📊 **Portfolio Tracking**\n- Add/manage stock holdings\n- Track real-time P&L\n- View portfolio performance\n\n🔔 **Price Alerts**\n- Set price notifications\n- Email alerts when triggered\n\n📰 **Sentiment Analysis**\n- Analyze news sentiment\n- Understand market perception\n\n📈 **Strategy Backtesting**\n- Test trading strategies\n- View performance metrics\n\n💬 Ask me about any feature for detailed help!';
    }
    // Greetings
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = 'Hello! 👋 I\'m your StockMind assistant. I can help you with:\n\n• Portfolio tracking and P&L\n• Setting price alerts\n• Sentiment analysis\n• Strategy backtesting\n• Chart analysis\n\nWhat would you like to know? Just ask!';
    }
    // Price queries
    else if (lowerMessage.includes('price') || lowerMessage.includes('stock price') || lowerMessage.includes('current price')) {
      response = 'Stock prices update in real-time! You can:\n\n1. **In Portfolio**: See current prices for all your holdings\n2. **Price Alerts**: Get notified when prices hit targets\n3. **Charts**: View price history and trends\n\nAdd stocks to your portfolio to start tracking prices!';
    }
    // P&L queries
    else if (lowerMessage.includes('profit') || lowerMessage.includes('loss') || lowerMessage.includes('gain')) {
      response = 'Track your P&L in the Portfolio section:\n\n💰 **Total P&L**: Overall profit/loss across all stocks\n📈 **Daily P&L**: Today\'s change in portfolio value\n📊 **Individual P&L**: Per-stock profit/loss\n🏆 **Best/Worst**: Top performers and losers\n\nAll values update automatically!';
    }
    // Getting started
    else if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new')) {
      response = 'Welcome to StockMind! Here\'s how to get started:\n\n1️⃣ **Add Stocks**: Go to Portfolio → Add Stock\n2️⃣ **Set Alerts**: Go to Price Alerts → Create Alert\n3️⃣ **Analyze Sentiment**: Go to Sentiment Analysis → Enter symbol\n4️⃣ **Test Strategies**: Go to Backtest Strategy → Run Backtest\n\nNeed help with any step? Just ask!';
    }
    // Default response
    else {
      response = 'I can help you with portfolio tracking, price alerts, sentiment analysis, and strategy backtesting.\n\nTry asking:\n• "How do I add stocks to my portfolio?"\n• "How do price alerts work?"\n• "What is sentiment analysis?"\n• "How do I backtest a strategy?"\n• "What features are available?"\n\nOr type "help" for a full list of features!';
    }
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

