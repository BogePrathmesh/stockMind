import { getHistoricalData } from './stockData.service.js';

// Simple moving average calculation
const calculateMA = (prices, period) => {
  const ma = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ma.push(null);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
  }
  return ma;
};

// RSI calculation
const calculateRSI = (prices, period = 14) => {
  const rsi = [];
  const changes = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      const recentChanges = changes.slice(i - period, i);
      const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
      const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
      
      if (losses === 0) {
        rsi.push(100);
      } else {
        const rs = gains / losses;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return rsi;
};

export const backtestStrategy = async (symbol, strategy, startDate, endDate, initialCapital) => {
  try {
    // Get historical data
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const historicalData = await getHistoricalData(symbol, daysDiff);
    
    if (historicalData.length < 200) {
      throw new Error('Insufficient historical data for backtesting');
    }
    
    const prices = historicalData.map(d => d.close);
    const dates = historicalData.map(d => d.date);
    
    // Parse strategy
    const strategyObj = typeof strategy === 'string' ? JSON.parse(strategy) : strategy;
    
    // Calculate indicators
    const ma50 = calculateMA(prices, 50);
    const ma200 = calculateMA(prices, 200);
    const rsi = calculateRSI(prices, 14);
    
    // Initialize backtest variables
    let capital = initialCapital;
    let shares = 0;
    let trades = [];
    let equityCurve = [];
    let maxCapital = initialCapital;
    let maxDrawdown = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    
    // Run backtest
    for (let i = 200; i < prices.length; i++) {
      const currentPrice = prices[i];
      const currentDate = dates[i];
      const currentMA50 = ma50[i];
      const currentMA200 = ma200[i];
      const currentRSI = rsi[i];
      
      // Buy signal
      let buySignal = false;
      if (strategyObj.buyCondition === 'MA_CROSSOVER' && currentMA50 && currentMA200) {
        buySignal = currentMA50 > currentMA200 && ma50[i - 1] <= ma200[i - 1];
      } else if (strategyObj.buyCondition === 'RSI_OVERSOLD' && currentRSI) {
        buySignal = currentRSI < 30;
      }
      
      // Sell signal
      let sellSignal = false;
      if (strategyObj.sellCondition === 'MA_CROSSOVER' && currentMA50 && currentMA200) {
        sellSignal = currentMA50 < currentMA200 && ma50[i - 1] >= ma200[i - 1];
      } else if (strategyObj.sellCondition === 'RSI_OVERBOUGHT' && currentRSI) {
        sellSignal = currentRSI > 70;
      }
      
      // Execute trades
      if (buySignal && shares === 0 && capital >= currentPrice) {
        shares = Math.floor(capital / currentPrice);
        const cost = shares * currentPrice;
        capital -= cost;
        
        trades.push({
          type: 'BUY',
          date: currentDate,
          price: currentPrice,
          shares,
          cost
        });
      }
      
      if (sellSignal && shares > 0) {
        const revenue = shares * currentPrice;
        const tradeCost = trades[trades.length - 1]?.cost || 0;
        const profit = revenue - tradeCost;
        
        if (profit > 0) {
          winningTrades++;
        } else {
          losingTrades++;
        }
        
        trades.push({
          type: 'SELL',
          date: currentDate,
          price: currentPrice,
          shares,
          revenue,
          profit
        });
        
        capital += revenue;
        shares = 0;
      }
      
      // Update equity curve
      const currentEquity = capital + (shares * currentPrice);
      equityCurve.push({
        date: currentDate,
        equity: currentEquity
      });
      
      if (currentEquity > maxCapital) {
        maxCapital = currentEquity;
      }
      
      const drawdown = ((maxCapital - currentEquity) / maxCapital) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Finalize - sell remaining shares
    if (shares > 0) {
      const finalPrice = prices[prices.length - 1];
      capital += shares * finalPrice;
      shares = 0;
    }
    
    // Calculate metrics
    const finalCapital = capital;
    const returnPercent = ((finalCapital - initialCapital) / initialCapital) * 100;
    const totalTrades = trades.filter(t => t.type === 'SELL').length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;
    
    return {
      symbol,
      initialCapital,
      finalCapital: parseFloat(finalCapital.toFixed(2)),
      returnPercent: parseFloat(returnPercent.toFixed(2)),
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: parseFloat(winRate.toFixed(2)),
      lossRate: parseFloat(lossRate.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      equityCurve: JSON.stringify(equityCurve),
      trades: trades.slice(0, 100) // Limit trades for response size
    };
  } catch (error) {
    console.error('Error in backtest:', error);
    throw new Error(`Backtest failed: ${error.message}`);
  }
};

