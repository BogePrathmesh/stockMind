import prisma from '../utils/db.js';
import { backtestStrategy } from '../services/backtest.service.js';

// Get all backtests for user
export const getBacktests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let backtests;
    try {
      backtests = await prisma.backtestStrategy.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      // If model doesn't exist, return empty array
      if (error.message.includes('model') || error.message.includes('BacktestStrategy')) {
        return res.json([]);
      }
      throw error;
    }
    
    res.json(backtests || []);
  } catch (error) {
    console.error('Get backtests error:', error);
    // Return empty array instead of error for better UX
    res.json([]);
  }
};

// Create backtest
export const createBacktest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, symbol, strategy, startDate, endDate, initialCapital } = req.body;
    
    if (!name || !symbol || !strategy || !startDate || !endDate || !initialCapital) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Run backtest
    const result = await backtestStrategy(
      symbol,
      strategy,
      startDate,
      endDate,
      parseFloat(initialCapital)
    );
    
    // Save to database
    const backtest = await prisma.backtestStrategy.create({
      data: {
        userId,
        name,
        symbol: symbol.toUpperCase(),
        strategy: typeof strategy === 'string' ? strategy : JSON.stringify(strategy),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        initialCapital: parseFloat(initialCapital),
        finalCapital: result.finalCapital,
        returnPercent: result.returnPercent,
        winRate: result.winRate,
        lossRate: result.lossRate,
        maxDrawdown: result.maxDrawdown,
        totalTrades: result.totalTrades,
        winningTrades: result.winningTrades,
        losingTrades: result.losingTrades,
        equityCurve: result.equityCurve
      }
    });
    
    res.json(backtest);
  } catch (error) {
    console.error('Create backtest error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get backtest details
export const getBacktest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const backtest = await prisma.backtestStrategy.findUnique({
      where: { id }
    });
    
    if (!backtest) {
      return res.status(404).json({ message: 'Backtest not found' });
    }
    
    if (backtest.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(backtest);
  } catch (error) {
    console.error('Get backtest error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete backtest
export const deleteBacktest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const backtest = await prisma.backtestStrategy.findUnique({
      where: { id }
    });
    
    if (!backtest) {
      return res.status(404).json({ message: 'Backtest not found' });
    }
    
    if (backtest.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await prisma.backtestStrategy.delete({
      where: { id }
    });
    
    res.json({ message: 'Backtest deleted successfully' });
  } catch (error) {
    console.error('Delete backtest error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

