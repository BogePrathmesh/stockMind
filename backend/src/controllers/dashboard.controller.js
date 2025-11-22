import prisma from '../utils/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { warehouseId, startDate, endDate } = req.query;

    const receiptWhere = {};
    const deliveryWhere = {};
    const transferWhere = {};
    const adjustmentWhere = {};

    if (warehouseId) {
      receiptWhere.warehouseId = warehouseId;
      deliveryWhere.warehouseId = warehouseId;
      transferWhere.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId }
      ];
      adjustmentWhere.warehouseId = warehouseId;
    }

    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      receiptWhere.createdAt = dateFilter;
      deliveryWhere.createdAt = dateFilter;
      transferWhere.createdAt = dateFilter;
      adjustmentWhere.createdAt = dateFilter;
    }

    // Total Products
    const totalProducts = await prisma.product.count();

    // Low Stock Items - Get all products with stock
    const products = await prisma.product.findMany({
      include: {
        stock: warehouseId
          ? { where: { warehouseId } }
          : true
      }
    });

    const lowStockItems = products.filter(product => {
      if (warehouseId) {
        const stock = product.stock.find(s => s.warehouseId === warehouseId);
        return stock && stock.quantity <= (product.reorderLevel || 0);
      }
      return product.stock.some(s => s.quantity <= (product.reorderLevel || 0));
    }).length;

    // Pending Receipts (not DONE)
    const pendingReceipts = await prisma.receipt.count({
      where: {
        ...receiptWhere,
        status: { not: 'DONE' }
      }
    });

    // Pending Deliveries (not DONE)
    const pendingDeliveries = await prisma.delivery.count({
      where: {
        ...deliveryWhere,
        status: { not: 'DONE' }
      }
    });

    // Scheduled Transfers (not DONE)
    const scheduledTransfers = await prisma.transfer.count({
      where: {
        ...transferWhere,
        status: { not: 'DONE' }
      }
    });

    // Pending Adjustments (all are pending by default)
    const pendingAdjustments = await prisma.stockAdjustment.count({
      where: adjustmentWhere
    });

    // Stock over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...(warehouseId && { warehouseId })
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const stockOverTime = {};
    stockMovements.forEach(movement => {
      const date = movement.createdAt.toISOString().split('T')[0];
      if (!stockOverTime[date]) {
        stockOverTime[date] = { date, stock: 0 };
      }
      stockOverTime[date].stock += movement.newStock || 0;
    });

    // If no data, return empty array
    const stockOverTimeArray = Object.values(stockOverTime);
    if (stockOverTimeArray.length === 0) {
      // Return last 7 days with 0 stock
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        stockOverTimeArray.push({
          date: date.toISOString().split('T')[0],
          stock: 0
        });
      }
    }

    // Items by category
    const itemsByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    });

    const categoryData = [];
    if (itemsByCategory.length > 0) {
      const categoryIds = itemsByCategory.map(item => item.categoryId).filter(Boolean);
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds }
        }
      });

      itemsByCategory.forEach(item => {
        const category = categories.find(c => c.id === item.categoryId);
        if (category) {
          categoryData.push({
            category: category.name,
            count: item._count.id
          });
        }
      });
    }

    // If no categories, return empty array
    if (categoryData.length === 0) {
      categoryData.push({ category: 'No Categories', count: 0 });
    }

    // Recent activity
    const recentActivity = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, sku: true }
        },
        warehouse: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true }
        }
      }
    });

    res.json({
      kpis: {
        totalProducts,
        lowStockItems,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        pendingAdjustments
      },
      stockOverTime: stockOverTimeArray,
      itemsByCategory: categoryData,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        product: activity.product?.name || 'Unknown',
        sku: activity.product?.sku || 'N/A',
        warehouse: activity.warehouse?.name || 'Unknown',
        movementType: activity.movementType,
        change: activity.change || 0,
        newStock: activity.newStock || 0,
        createdAt: activity.createdAt,
        createdBy: activity.createdBy?.name || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
