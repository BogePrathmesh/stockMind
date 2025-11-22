import prisma from '../utils/db.js';

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(warehouses);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    res.json(warehouse);
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { name, address, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Warehouse name is required' });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        address,
        description
      }
    });

    res.status(201).json(warehouse);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Warehouse name already exists' });
    }
    console.error('Create warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    });

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;

    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData
    });

    res.json(updatedWarehouse);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Warehouse name already exists' });
    }
    console.error('Update warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id }
    });

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    await prisma.warehouse.delete({
      where: { id }
    });

    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






