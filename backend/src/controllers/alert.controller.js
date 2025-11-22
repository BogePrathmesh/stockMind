import prisma from '../utils/db.js';
import { getStockPrice } from '../services/stockData.service.js';
import { sendEmail } from '../utils/email.js';

// Get all alerts for user
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let alerts;
    try {
      alerts = await prisma.priceAlert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      // If model doesn't exist, return empty array
      if (error.message.includes('model') || error.message.includes('PriceAlert')) {
        return res.json([]);
      }
      throw error;
    }
    
    res.json(alerts || []);
  } catch (error) {
    console.error('Get alerts error:', error);
    // Return empty array instead of error for better UX
    res.json([]);
  }
};

// Create alert
export const createAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, alertType, targetValue, targetPercent } = req.body;
    
    if (!symbol || !alertType) {
      return res.status(400).json({ message: 'Symbol and alert type are required' });
    }
    
    if (alertType === 'PRICE_ABOVE' || alertType === 'PRICE_BELOW') {
      if (!targetValue) {
        return res.status(400).json({ message: 'Target value is required for price alerts' });
      }
    }
    
    if (alertType === 'PRICE_CHANGE_PERCENT' || alertType === 'VOLUME_INCREASE') {
      if (!targetPercent) {
        return res.status(400).json({ message: 'Target percent is required for percent-based alerts' });
      }
    }
    
    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        alertType,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        targetPercent: targetPercent ? parseFloat(targetPercent) : null,
        status: 'ACTIVE'
      }
    });
    
    res.json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update alert
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, targetValue, targetPercent } = req.body;
    
    const alert = await prisma.priceAlert.findUnique({
      where: { id }
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (alert.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const updated = await prisma.priceAlert.update({
      where: { id },
      data: {
        status: status || alert.status,
        targetValue: targetValue !== undefined ? parseFloat(targetValue) : alert.targetValue,
        targetPercent: targetPercent !== undefined ? parseFloat(targetPercent) : alert.targetPercent
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete alert
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await prisma.priceAlert.findUnique({
      where: { id }
    });
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    if (alert.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await prisma.priceAlert.delete({
      where: { id }
    });
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check alerts (called by cron job)
export const checkAlerts = async () => {
  try {
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: true
      }
    });
    
    for (const alert of activeAlerts) {
      try {
        const stockData = await getStockPrice(alert.symbol);
        let triggered = false;
        let message = '';
        
        switch (alert.alertType) {
          case 'PRICE_ABOVE':
            if (stockData.price >= alert.targetValue) {
              triggered = true;
              message = `${alert.symbol} crossed above ₹${alert.targetValue}. Current price: ₹${stockData.price}`;
            }
            break;
          case 'PRICE_BELOW':
            if (stockData.price <= alert.targetValue) {
              triggered = true;
              message = `${alert.symbol} dropped below ₹${alert.targetValue}. Current price: ₹${stockData.price}`;
            }
            break;
          case 'PRICE_CHANGE_PERCENT':
            if (Math.abs(stockData.changePercent) >= alert.targetPercent) {
              triggered = true;
              message = `${alert.symbol} changed by ${stockData.changePercent}% (threshold: ${alert.targetPercent}%)`;
            }
            break;
          case 'VOLUME_INCREASE':
            // This would require historical volume data
            // For now, we'll skip this check
            break;
        }
        
        if (triggered) {
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              status: 'TRIGGERED',
              triggeredAt: new Date()
            }
          });
          
          // Send email notification
          if (alert.user.email) {
            await sendEmail(
              alert.user.email,
              `Price Alert: ${alert.symbol}`,
              message
            );
          }
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Check alerts error:', error);
  }
};

