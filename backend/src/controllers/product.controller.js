import prisma from '../utils/db.js';
import { emitStockUpdate, emitDashboardUpdate } from '../services/socket.service.js';

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      categoryId,
      warehouseId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stock: warehouseId
          ? {
              where: { warehouseId },
              include: { warehouse: true }
            }
          : {
              include: { warehouse: true }
            }
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder }
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stock: {
          include: { warehouse: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      categoryId,
      unitOfMeasure,
      description,
      reorderLevel,
      initialStock,
      warehouseId
    } = req.body;

    if (!name || !sku || !categoryId || !unitOfMeasure) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if SKU exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId,
        unitOfMeasure,
        image,
        description,
        reorderLevel: parseInt(reorderLevel) || 0
      },
      include: {
        category: true
      }
    });

    // Add initial stock if provided
    if (initialStock && warehouseId) {
      await prisma.productStock.create({
        data: {
          productId: product.id,
          warehouseId,
          quantity: parseInt(initialStock)
        }
      });
    }

    // Emit real-time update
    emitDashboardUpdate({ type: 'product-created' });
    emitStockUpdate({ type: 'product-created', productId: product.id });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      categoryId,
      unitOfMeasure,
      description,
      reorderLevel
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check SKU uniqueness if changed
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku }
      });
      if (skuExists) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (sku) updateData.sku = sku;
    if (categoryId) updateData.categoryId = categoryId;
    if (unitOfMeasure) updateData.unitOfMeasure = unitOfMeasure;
    if (description !== undefined) updateData.description = description;
    if (reorderLevel !== undefined) updateData.reorderLevel = parseInt(reorderLevel);

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        stock: {
          include: { warehouse: true }
        }
      }
    });

    // Emit real-time update
    emitDashboardUpdate({ type: 'product-updated' });
    emitStockUpdate({ type: 'product-updated', productId: product.id });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id }
    });

    // Emit real-time update
    emitDashboardUpdate({ type: 'product-deleted' });
    emitStockUpdate({ type: 'product-deleted', productId: id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProductStock = async (req, res) => {
  try {
    const { productId, warehouseId } = req.query;

    const where = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    const stock = await prisma.productStock.findMany({
      where,
      include: {
        product: {
          include: { category: true }
        },
        warehouse: true
      }
    });

    res.json(stock);
  } catch (error) {
    console.error('Get product stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const { warehouseId } = req.query;

    const products = await prisma.product.findMany({
      include: {
        category: true,
        stock: warehouseId
          ? {
              where: { warehouseId },
              include: { warehouse: true }
            }
          : {
              include: { warehouse: true }
            }
      }
    });

    const lowStockProducts = products.filter(product => {
      if (warehouseId) {
        const stock = product.stock.find(s => s.warehouseId === warehouseId);
        return stock && stock.quantity <= product.reorderLevel;
      }
      return product.stock.some(s => s.quantity <= product.reorderLevel);
    });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


