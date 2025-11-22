import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import receiptRoutes from './src/routes/receipt.routes.js';
import deliveryRoutes from './src/routes/delivery.routes.js';
import transferRoutes from './src/routes/transfer.routes.js';
import adjustmentRoutes from './src/routes/adjustment.routes.js';
import ledgerRoutes from './src/routes/ledger.routes.js';
import warehouseRoutes from './src/routes/warehouse.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import profileRoutes from './src/routes/profile.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import portfolioRoutes from './src/routes/portfolio.routes.js';
import alertRoutes from './src/routes/alert.routes.js';
import sentimentRoutes from './src/routes/sentiment.routes.js';
import backtestRoutes from './src/routes/backtest.routes.js';
import chatbotRoutes from './src/routes/chatbot.routes.js';
import stockRoutes from './src/routes/stock.routes.js';

// Socket.io setup
import { setupSocketIO } from './src/services/socket.service.js';

// Alert checking
import cron from 'node-cron';
import { checkAlerts } from './src/controllers/alert.controller.js';

// Real-time stock price updates
import { startStockPriceUpdates } from './src/services/stockPriceUpdater.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Socket.IO
setupSocketIO(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/stock', stockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StockMaster IMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Schedule alert checking every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Checking price alerts...');
    checkAlerts().catch(console.error);
  });
  
  console.log('✅ Alert checking scheduled (every 5 minutes)');
  
  // Start real-time stock price updates
  startStockPriceUpdates();
  console.log('✅ Real-time stock price updates started (every 30 seconds)');
});

export { io };



