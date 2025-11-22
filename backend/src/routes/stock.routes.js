import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getStockPrice, getHistoricalData } from '../services/stockData.service.js';

const router = express.Router();

router.use(authenticate);

// Get real-time stock price
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await getStockPrice(symbol);
    res.json(price);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ message: 'Failed to fetch stock price', error: error.message });
  }
});

// Get historical data
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days) || 30;
    const data = await getHistoricalData(symbol, days);
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Failed to fetch historical data', error: error.message });
  }
});

export default router;

