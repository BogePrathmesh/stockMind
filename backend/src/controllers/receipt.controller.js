import prisma from '../utils/db.js';
import { generateReceiptId } from '../utils/generateId.js';
import { generateReceiptPDF } from '../services/pdf.service.js';
import { emitStockUpdate, emitDashboardUpdate } from '../services/socket.service.js';

export const getReceipts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      warehouseId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { receiptId: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        warehouse: true,
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

    const total = await prisma.receipt.count({ where });

    res.json({
      receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createReceipt = async (req, res) => {
  try {
    const { supplier, warehouseId, items } = req.body;

    if (!supplier || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid receipt data' });
    }

    const receiptId = generateReceiptId();

    const receipt = await prisma.receipt.create({
      data: {
        receiptId,
        supplier,
        warehouseId,
        createdById: req.user.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null
          }))
        }
      },
      include: {
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'receipt-created' });

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, warehouseId, items, status } = req.body;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'DONE') {
      return res.status(400).json({ message: 'Cannot update completed receipt' });
    }

    const updateData = {};
    if (supplier) updateData.supplier = supplier;
    if (warehouseId) updateData.warehouseId = warehouseId;
    if (status) updateData.status = status;

    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.receiptItem.deleteMany({
        where: { receiptId: id }
      });

      // Create new items
      updateData.items = {
        create: items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null
        }))
      };
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'receipt-updated' });

    res.json(updatedReceipt);
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const validateReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        },
        warehouse: true
      }
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'DONE') {
      return res.status(400).json({ message: 'Receipt already validated' });
    }

    // Update stock for each item
    for (const item of receipt.items) {
      // Find or create product stock
      const existingStock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: receipt.warehouseId
          }
        }
      });

      const previousStock = existingStock ? existingStock.quantity : 0;
      const newStock = previousStock + item.quantity;

      if (existingStock) {
        await prisma.productStock.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: receipt.warehouseId
            }
          },
          data: { quantity: newStock }
        });
      } else {
        await prisma.productStock.create({
          data: {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
            quantity: newStock
          }
        });
      }

      // Create stock movement entry
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          movementType: 'RECEIPT',
          change: item.quantity,
          previousStock,
          newStock,
          referenceId: receipt.receiptId,
          notes: `Receipt ${receipt.receiptId}`,
          createdById: req.user.id
        }
      });

      emitStockUpdate({
        productId: item.productId,
        warehouseId: receipt.warehouseId,
        quantity: newStock
      });
    }

    // Update receipt status
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: {
        status: 'DONE',
        validatedAt: new Date()
      },
      include: {
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    emitDashboardUpdate({ type: 'receipt-validated' });

    res.json(updatedReceipt);
  } catch (error) {
    console.error('Validate receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateReceiptPDFRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const { filename, filepath } = await generateReceiptPDF(
      receipt,
      receipt.items,
      receipt.warehouse
    );

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
    });
  } catch (error) {
    console.error('Generate receipt PDF error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



