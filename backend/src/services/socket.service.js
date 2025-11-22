export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

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



