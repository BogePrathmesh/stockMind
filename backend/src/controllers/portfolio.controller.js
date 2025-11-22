import prisma from '../utils/db.js';
import { getStockPrice, getMultipleStockPrices } from '../services/stockData.service.js';
import { emitPortfolioUpdate } from '../services/socket.service.js';

// Get or create portfolio for user
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let portfolio;
    try {
      portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
          holdings: true
        }
      });
    } catch (error) {
      // If model doesn't exist, return empty portfolio structure
      if (error.message.includes('model') || error.message.includes('Portfolio')) {
        return res.json({
          id: null,
          userId,
          totalValue: 0,
          totalCost: 0,
          totalPnL: 0,
          dailyPnL: 0,
          holdings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      throw error;
    }
    
    if (!portfolio) {
      try {
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            totalValue: 0,
            totalCost: 0,
            totalPnL: 0,
            dailyPnL: 0
          },
          include: {
            holdings: true
          }
        });
      } catch (error) {
        // If model doesn't exist, return empty portfolio structure
        if (error.message.includes('model') || error.message.includes('Portfolio')) {
          return res.json({
            id: null,
            userId,
            totalValue: 0,
            totalCost: 0,
            totalPnL: 0,
            dailyPnL: 0,
            holdings: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        throw error;
      }
    }
    
    // Update prices for all holdings
    if (portfolio && portfolio.holdings && portfolio.holdings.length > 0) {
      try {
        const symbols = portfolio.holdings.map(h => h.symbol);
        const prices = await getMultipleStockPrices(symbols);
        const priceMap = {};
        prices.forEach(p => {
          priceMap[p.symbol] = p;
        });
        
        let totalValue = 0;
        let totalCost = 0;
        
        // Update each holding
        for (const holding of portfolio.holdings) {
          try {
            const currentPrice = priceMap[holding.symbol]?.price || holding.currentPrice;
            const currentValue = holding.quantity * currentPrice;
            const pnl = currentValue - holding.totalCost;
            const pnlPercent = (pnl / holding.totalCost) * 100;
            
            await prisma.stockHolding.update({
              where: { id: holding.id },
              data: {
                currentPrice,
                currentValue,
                pnl,
                pnlPercent
              }
            });
            
            totalValue += currentValue;
            totalCost += holding.totalCost;
          } catch (error) {
            console.error(`Error updating holding ${holding.id}:`, error.message);
            // Continue with other holdings
            totalValue += holding.currentValue || 0;
            totalCost += holding.totalCost || 0;
          }
        }
        
        const totalPnL = totalValue - totalCost;
        const previousValue = portfolio.totalValue || totalValue;
        const dailyPnL = totalValue - previousValue;
        
        try {
          portfolio = await prisma.portfolio.update({
            where: { id: portfolio.id },
            data: {
              totalValue,
              totalCost,
              totalPnL,
              dailyPnL
            },
            include: {
              holdings: {
                orderBy: {
                  pnl: 'desc'
                }
              }
            }
          });
          
          // Save portfolio history
          try {
            await prisma.portfolioHistory.create({
              data: {
                portfolioId: portfolio.id,
                totalValue,
                totalPnL,
                date: new Date()
              }
            });
          } catch (error) {
            console.warn('Could not save portfolio history:', error.message);
          }

          // Emit real-time portfolio update
          try {
            emitPortfolioUpdate(userId, portfolio);
          } catch (error) {
            console.warn('Could not emit portfolio update:', error.message);
          }
        } catch (error) {
          console.error('Error updating portfolio:', error.message);
        }
      } catch (error) {
        console.error('Error updating holdings prices:', error.message);
      }
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add stock to portfolio
export const addHolding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, name, quantity, buyPrice } = req.body;
    
    if (!symbol || !name || !quantity || !buyPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get or create portfolio
    let portfolio;
    try {
      portfolio = await prisma.portfolio.findUnique({
        where: { userId }
      });
    } catch (error) {
      if (error.message.includes('model') || error.message.includes('Portfolio')) {
        return res.status(503).json({ 
          message: 'Database migration required. Please run: npm run prisma:migrate in the backend directory' 
        });
      }
      throw error;
    }
    
    if (!portfolio) {
      try {
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            totalValue: 0,
            totalCost: 0,
            totalPnL: 0,
            dailyPnL: 0
          }
        });
      } catch (error) {
        if (error.message.includes('model') || error.message.includes('Portfolio')) {
          return res.status(503).json({ 
            message: 'Database migration required. Please run: npm run prisma:migrate in the backend directory' 
          });
        }
        throw error;
      }
    }
    
    // Validate inputs
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);
    
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Buy price must be a positive number' });
    }
    
    // Clean symbol (remove special characters except letters and numbers)
    const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!cleanSymbol || cleanSymbol.length === 0) {
      return res.status(400).json({ message: 'Invalid stock symbol. Use letters and numbers only.' });
    }
    
    // Get current price (with error handling)
    let stockData;
    let currentPrice = price; // Default to buy price if API fails
    
    try {
      stockData = await getStockPrice(cleanSymbol);
      currentPrice = stockData.price || price;
    } catch (error) {
      console.warn(`Could not fetch price for ${cleanSymbol}, using buy price:`, error.message);
      // Continue with buy price as current price
    }
    
    const totalCost = qty * price;
    const currentValue = qty * currentPrice;
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    
    // Create holding
    let holding;
    try {
      holding = await prisma.stockHolding.create({
        data: {
          portfolioId: portfolio.id,
          symbol: cleanSymbol,
          name: name.trim(),
          quantity: qty,
          buyPrice: price,
          currentPrice: currentPrice,
          totalCost,
          currentValue,
          pnl,
          pnlPercent
        }
      });
    } catch (error) {
      if (error.message.includes('model') || error.message.includes('StockHolding')) {
        return res.status(503).json({ 
          message: 'Database migration required. Please run: npm run prisma:migrate in the backend directory',
          details: 'The StockHolding model does not exist. Run the migration to create it.'
        });
      }
      // Check for duplicate symbol
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'This stock is already in your portfolio. Update the existing holding instead.' });
      }
      throw error;
    }
    
    // Update portfolio totals
    try {
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalCost: (portfolio.totalCost || 0) + totalCost,
          totalValue: (portfolio.totalValue || 0) + currentValue,
          totalPnL: (portfolio.totalPnL || 0) + pnl
        }
      });
    } catch (error) {
      console.error('Error updating portfolio totals:', error);
      // Still return the holding even if portfolio update fails
    }
    
    res.json(holding);
  } catch (error) {
    console.error('Add holding error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('model') || error.message.includes('Portfolio') || error.message.includes('StockHolding')) {
      return res.status(503).json({ 
        message: 'Database migration required',
        details: 'Please run: cd backend && npm run prisma:migrate',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to add stock to portfolio', 
      error: error.message 
    });
  }
};

// Update holding
export const updateHolding = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, buyPrice } = req.body;
    
    const holding = await prisma.stockHolding.findUnique({
      where: { id },
      include: { portfolio: true }
    });
    
    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }
    
    // Verify ownership
    if (holding.portfolio.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const totalCost = (quantity || holding.quantity) * (buyPrice || holding.buyPrice);
    const currentValue = (quantity || holding.quantity) * holding.currentPrice;
    const pnl = currentValue - totalCost;
    const pnlPercent = (pnl / totalCost) * 100;
    
    const updated = await prisma.stockHolding.update({
      where: { id },
      data: {
        quantity: quantity ? parseFloat(quantity) : holding.quantity,
        buyPrice: buyPrice ? parseFloat(buyPrice) : holding.buyPrice,
        totalCost,
        currentValue,
        pnl,
        pnlPercent
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update holding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete holding
export const deleteHolding = async (req, res) => {
  try {
    const { id } = req.params;
    
    const holding = await prisma.stockHolding.findUnique({
      where: { id },
      include: { portfolio: true }
    });
    
    if (!holding) {
      return res.status(404).json({ message: 'Holding not found' });
    }
    
    if (holding.portfolio.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await prisma.stockHolding.delete({
      where: { id }
    });
    
    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    console.error('Delete holding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get portfolio history
export const getPortfolioHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let portfolio;
    try {
      portfolio = await prisma.portfolio.findUnique({
        where: { userId }
      });
    } catch (error) {
      // If model doesn't exist, return empty array
      if (error.message.includes('model') || error.message.includes('Portfolio')) {
        return res.json([]);
      }
      throw error;
    }
    
    if (!portfolio) {
      return res.json([]);
    }
    
    let history;
    try {
      history = await prisma.portfolioHistory.findMany({
        where: { portfolioId: portfolio.id },
        orderBy: { date: 'asc' },
        take: 30 // Last 30 days
      });
    } catch (error) {
      // If model doesn't exist, return empty array
      if (error.message.includes('model') || error.message.includes('PortfolioHistory')) {
        return res.json([]);
      }
      throw error;
    }
    
    res.json(history || []);
  } catch (error) {
    console.error('Get portfolio history error:', error);
    // Return empty array instead of error
    res.json([]);
  }
};

