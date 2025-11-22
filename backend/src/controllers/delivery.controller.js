import prisma from '../utils/db.js';
import { generateDeliveryId } from '../utils/generateId.js';
import { generateDeliveryPDF } from '../services/pdf.service.js';
import { emitStockUpdate, emitDashboardUpdate } from '../services/socket.service.js';

export const getDeliveries = async (req, res) => {
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
        { deliveryId: { contains: search, mode: 'insensitive' } },
        { customer: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) where.status = status;
    if (warehouseId) where.warehouseId = warehouseId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const deliveries = await prisma.delivery.findMany({
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

    const total = await prisma.delivery.count({ where });

    res.json({
      deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
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

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const { customer, warehouseId, items } = req.body;

    if (!customer || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid delivery data' });
    }

    // Check stock availability
    for (const item of items) {
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId
          }
        }
      });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.productId}`
        });
      }
    }

    const deliveryId = generateDeliveryId();

    const delivery = await prisma.delivery.create({
      data: {
        deliveryId,
        customer,
        warehouseId,
        createdById: req.user.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity)
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

    emitDashboardUpdate({ type: 'delivery-created' });

    res.status(201).json(delivery);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, warehouseId, items, status } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status === 'DONE') {
      return res.status(400).json({ message: 'Cannot update completed delivery' });
    }

    const updateData = {};
    if (customer) updateData.customer = customer;
    if (warehouseId) updateData.warehouseId = warehouseId;
    if (status) updateData.status = status;

    if (items && Array.isArray(items)) {
      // Check stock if validating
      if (status === 'DONE') {
        for (const item of items) {
          const stock = await prisma.productStock.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: delivery.warehouseId
              }
            }
          });

          if (!stock || stock.quantity < item.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for product ${item.productId}`
            });
          }
        }
      }

      // Delete existing items
      await prisma.deliveryItem.deleteMany({
        where: { deliveryId: id }
      });

      // Create new items
      updateData.items = {
        create: items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        }))
      };
    }

    const updatedDelivery = await prisma.delivery.update({
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

    emitDashboardUpdate({ type: 'delivery-updated' });

    res.json(updatedDelivery);
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const validateDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        },
        warehouse: true
      }
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status === 'DONE') {
      return res.status(400).json({ message: 'Delivery already validated' });
    }

    // Update stock for each item
    for (const item of delivery.items) {
      const stock = await prisma.productStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: delivery.warehouseId
          }
        }
      });

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.product.name}`
        });
      }

      const previousStock = stock.quantity;
      const newStock = previousStock - item.quantity;

      await prisma.productStock.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: delivery.warehouseId
          }
        },
        data: { quantity: newStock }
      });

      // Create stock movement entry
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: delivery.warehouseId,
          movementType: 'DELIVERY',
          change: -item.quantity,
          previousStock,
          newStock,
          referenceId: delivery.deliveryId,
          notes: `Delivery ${delivery.deliveryId}`,
          createdById: req.user.id
        }
      });

      emitStockUpdate({
        productId: item.productId,
        warehouseId: delivery.warehouseId,
        quantity: newStock
      });
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
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

    emitDashboardUpdate({ type: 'delivery-validated' });

    res.json(updatedDelivery);
  } catch (error) {
    console.error('Validate delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateDeliveryPDFRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
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

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const { filename, filepath } = await generateDeliveryPDF(
      delivery,
      delivery.items,
      delivery.warehouse
    );

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
    });
  } catch (error) {
    console.error('Generate delivery PDF error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



