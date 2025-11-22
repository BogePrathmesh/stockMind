import prisma from '../utils/db.js';

export const getStockMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      productId,
      warehouseId,
      movementType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (movementType) where.movementType = movementType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const movements = await prisma.stockMovement.findMany({
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

    const total = await prisma.stockMovement.count({ where });

    res.json({
      movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStockMovement = async (req, res) => {
  try {
    const { id } = req.params;

    const movement = await prisma.stockMovement.findUnique({
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

    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }

    res.json(movement);
  } catch (error) {
    console.error('Get stock movement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



