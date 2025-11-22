import prisma from '../utils/db.js';
import { generateTransferId } from '../utils/generateId.js';
import { generateTransferPDF } from '../services/pdf.service.js';
import { emitStockUpdate, emitDashboardUpdate } from '../services/socket.service.js';

export const getTransfers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      fromWarehouseId,
      toWarehouseId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.transferId = { contains: search, mode: 'insensitive' };
    }

    if (status) where.status = status;
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) where.toWarehouseId = toWarehouseId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await prisma.transfer.count({ where });

    res.json({
      transfers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTransfer = async (req, res) => {
  try {
    const { fromWarehouseId, toWarehouseId, items, notes } = req.body;

    if (!fromWarehouseId || !toWarehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid transfer data' });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({ message: 'Source and destination warehouses cannot be the same' });
    }

    // Check stock availability
    for (const item of items) {
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: fromWarehouseId
          }
        }
      });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.productId} in source warehouse`
        });
      }
    }

    const transferId = generateTransferId();

    const transfer = await prisma.transfer.create({
      data: {
        transferId,
        fromWarehouseId,
        toWarehouseId,
        notes,
        createdById: req.user.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity)
          }))
        }
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'transfer-created' });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromWarehouseId, toWarehouseId, items, notes, status } = req.body;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (transfer.status === 'DONE') {
      return res.status(400).json({ message: 'Cannot update completed transfer' });
    }

    const updateData = {};
    if (fromWarehouseId) updateData.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) updateData.toWarehouseId = toWarehouseId;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.transferItem.deleteMany({
        where: { transferId: id }
      });

      // Create new items
      updateData.items = {
        create: items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        }))
      };
    }

    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: updateData,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'transfer-updated' });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Update transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const validateTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        },
        fromWarehouse: true,
        toWarehouse: true
      }
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (transfer.status === 'DONE') {
      return res.status(400).json({ message: 'Transfer already validated' });
    }

    // Process stock movement
    for (const item of transfer.items) {
      // Check source stock
      const fromStock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: transfer.fromWarehouseId
          }
        }
      });

      if (!fromStock || fromStock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.product.name} in source warehouse`
        });
      }

      // Update source warehouse stock
      const fromPreviousStock = fromStock.quantity;
      const fromNewStock = fromPreviousStock - item.quantity;

      await prisma.productStock.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: transfer.fromWarehouseId
          }
        },
        data: { quantity: fromNewStock }
      });

      // Update or create destination warehouse stock
      const toStock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: transfer.toWarehouseId
          }
        }
      });

      const toPreviousStock = toStock ? toStock.quantity : 0;
      const toNewStock = toPreviousStock + item.quantity;

      if (toStock) {
        await prisma.productStock.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: transfer.toWarehouseId
            }
          },
          data: { quantity: toNewStock }
        });
      } else {
        await prisma.productStock.create({
          data: {
            productId: item.productId,
            warehouseId: transfer.toWarehouseId,
            quantity: toNewStock
          }
        });
      }

      // Create stock movement entries
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: transfer.fromWarehouseId,
          movementType: 'TRANSFER',
          change: -item.quantity,
          previousStock: fromPreviousStock,
          newStock: fromNewStock,
          referenceId: transfer.transferId,
          notes: `Transfer ${transfer.transferId} - Out`,
          createdById: req.user.id
        }
      });

      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: transfer.toWarehouseId,
          movementType: 'TRANSFER',
          change: item.quantity,
          previousStock: toPreviousStock,
          newStock: toNewStock,
          referenceId: transfer.transferId,
          notes: `Transfer ${transfer.transferId} - In`,
          createdById: req.user.id
        }
      });

      emitStockUpdate({
        productId: item.productId,
        warehouseId: transfer.fromWarehouseId,
        quantity: fromNewStock
      });

      emitStockUpdate({
        productId: item.productId,
        warehouseId: transfer.toWarehouseId,
        quantity: toNewStock
      });
    }

    // Update transfer status
    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: {
        status: 'DONE',
        validatedAt: new Date()
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'transfer-validated' });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Validate transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateTransferPDFRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    const { filename, filepath } = await generateTransferPDF(
      transfer,
      transfer.items,
      transfer.fromWarehouse,
      transfer.toWarehouse
    );

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
    });
  } catch (error) {
    console.error('Generate transfer PDF error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



