import prisma from '../utils/db.js';
import { generateAdjustmentId } from '../utils/generateId.js';
import { emitStockUpdate, emitDashboardUpdate } from '../services/socket.service.js';

export const getAdjustments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      productId,
      warehouseId,
      reason,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.adjustmentId = { contains: search, mode: 'insensitive' };
    }

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (reason) where.reason = reason;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        product: {
          include: { category: true }
        },
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await prisma.stockAdjustment.count({ where });

    res.json({
      adjustments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get adjustments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    const adjustment = await prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        product: {
          include: { category: true }
        },
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    res.json(adjustment);
  } catch (error) {
    console.error('Get adjustment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createAdjustment = async (req, res) => {
  try {
    const { productId, warehouseId, reason, quantity, notes } = req.body;

    if (!productId || !warehouseId || !reason || quantity === undefined) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Get current stock
    const stock = await prisma.productStock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId
        }
      }
    });

    const previousStock = stock ? stock.quantity : 0;
    const newStock = parseInt(quantity);
    const change = newStock - previousStock;

    if (change === 0) {
      return res.status(400).json({ message: 'No adjustment needed' });
    }

    const adjustmentId = generateAdjustmentId();

    // Create adjustment
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        adjustmentId,
        productId,
        warehouseId,
        reason,
        quantity: newStock,
        previousStock,
        newStock,
        notes,
        createdById: req.user.id
      },
      include: {
        product: {
          include: { category: true }
        },
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update stock
    if (stock) {
      await prisma.productStock.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: { quantity: newStock }
      });
    } else {
      await prisma.productStock.create({
        data: {
          productId,
          warehouseId,
          quantity: newStock
        }
      });
    }

    // Create stock movement entry
    await prisma.stockMovement.create({
      data: {
        productId,
        warehouseId,
        movementType: 'ADJUSTMENT',
        change,
        previousStock,
        newStock,
        referenceId: adjustmentId,
        notes: `Adjustment ${adjustmentId} - ${reason}`,
        createdById: req.user.id
      }
    });

    emitStockUpdate({
      productId,
      warehouseId,
      quantity: newStock
    });

    emitDashboardUpdate({ type: 'adjustment-created' });

    res.status(201).json(adjustment);
  } catch (error) {
    console.error('Create adjustment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



