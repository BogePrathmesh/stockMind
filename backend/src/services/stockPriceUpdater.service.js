import { getStockPrice } from './stockData.service.js';
import { emitStockPriceUpdate, emitPortfolioUpdate } from './socket.service.js';
import prisma from '../utils/db.js';

// Track active subscriptions
const activeSubscriptions = new Map();

// Update stock prices in real-time
export const startStockPriceUpdates = () => {
  setInterval(async () => {
    try {
      // Get all unique symbols from active portfolios
      const portfolios = await prisma.portfolio.findMany({
        include: {
          holdings: {
            select: {
              symbol: true
            }
          }
        }
      });

      const symbols = new Set();
      portfolios.forEach(portfolio => {
        portfolio.holdings.forEach(holding => {
          symbols.add(holding.symbol);
        });
      });

      // Update prices for all symbols
      for (const symbol of symbols) {
        try {
          const priceData = await getStockPrice(symbol);
          emitStockPriceUpdate(symbol, priceData);

          // Also update holdings in database
          await updateHoldingsPrice(symbol, priceData.price);
        } catch (error) {
          console.error(`Error updating price for ${symbol}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in stock price update cycle:', error);
    }
  }, 30000); // Update every 30 seconds
};

// Update holdings price in database
const updateHoldingsPrice = async (symbol, currentPrice) => {
  try {
    const holdings = await prisma.stockHolding.findMany({
      where: { symbol: symbol.toUpperCase() },
      include: { portfolio: true }
    });

    for (const holding of holdings) {
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

      // Update portfolio totals
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: holding.portfolioId },
        include: { holdings: true }
      });

      if (portfolio) {
        let totalValue = 0;
        let totalCost = 0;

        portfolio.holdings.forEach(h => {
          totalValue += h.currentValue;
          totalCost += h.totalCost;
        });

        const totalPnL = totalValue - totalCost;
        const previousValue = portfolio.totalValue || totalValue;
        const dailyPnL = totalValue - previousValue;

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            totalValue,
            totalCost,
            totalPnL,
            dailyPnL
          }
        });

        // Emit portfolio update
        emitPortfolioUpdate(portfolio.userId, {
          ...portfolio,
          totalValue,
          totalCost,
          totalPnL,
          dailyPnL
        });
      }
    }
  } catch (error) {
    console.error(`Error updating holdings for ${symbol}:`, error);
  }
};

