export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Subscribe to stock price updates
    socket.on('subscribe-stock', (symbol) => {
      socket.join(`stock-${symbol.toUpperCase()}`);
      console.log(`Client ${socket.id} subscribed to ${symbol}`);
    });

    // Unsubscribe from stock price updates
    socket.on('unsubscribe-stock', (symbol) => {
      socket.leave(`stock-${symbol.toUpperCase()}`);
      console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
    });

    // Subscribe to portfolio updates
    socket.on('subscribe-portfolio', (userId) => {
      socket.join(`portfolio-${userId}`);
      console.log(`Client ${socket.id} subscribed to portfolio ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Export function to emit events
  global.io = io;
};

export const emitStockUpdate = (data) => {
  if (global.io) {
    global.io.emit('stock-update', data);
  }
};

export const emitDashboardUpdate = (data) => {
  if (global.io) {
    global.io.emit('dashboard-update', data);
  }
};

export const emitNotification = (userId, data) => {
  if (global.io) {
    global.io.to(`user-${userId}`).emit('notification', data);
  }
};

// Emit real-time stock price update
export const emitStockPriceUpdate = (symbol, priceData) => {
  if (global.io) {
    global.io.to(`stock-${symbol.toUpperCase()}`).emit('stock-price-update', {
      symbol: symbol.toUpperCase(),
      ...priceData
    });
  }
};

// Emit portfolio update
export const emitPortfolioUpdate = (userId, portfolioData) => {
  if (global.io) {
    global.io.to(`portfolio-${userId}`).emit('portfolio-update', portfolioData);
  }
};



