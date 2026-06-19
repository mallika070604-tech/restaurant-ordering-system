import { Router } from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import { adminAuth } from '../middleware/auth.js';
import { calculateTotals, generateOrderNumber } from '../utils/helpers.js';
import { generateInvoice, getInvoicePath } from '../services/invoiceService.js';
import fs from 'fs';

const router = Router();

const emitOrderEvent = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(event, data);
    io.to('kitchen').emit(event, data);
  }
};

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('table', 'number capacity')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/active', adminAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] },
    })
      .populate('table', 'number capacity')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/table/:tableNumber', async (req, res, next) => {
  try {
    const table = await Table.findOne({ number: Number(req.params.tableNumber) });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    const orders = await Order.find({
      table: table._id,
      status: { $nin: ['served', 'cancelled'] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('table', 'number capacity');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { tableNumber, items, customerNotes = '' } = req.body;

    if (!tableNumber || !items?.length) {
      return res.status(400).json({ error: 'Table number and items are required' });
    }

    const table = await Table.findOne({ number: tableNumber, isActive: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ error: `${item.menuItemId} is unavailable` });
      }
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes || '',
      });
    }

    const totals = calculateTotals(orderItems);
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      table: table._id,
      tableNumber: table.number,
      items: orderItems,
      customerNotes,
      ...totals,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const populated = await Order.findById(order._id).populate('table', 'number capacity');
    emitOrderEvent(req, 'order:created', populated);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('table', 'number capacity');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    emitOrderEvent(req, 'order:updated', order);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/invoice', adminAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const invoicePath = await generateInvoice(order);
    order.invoicePath = invoicePath;
    await order.save();

    res.json({ message: 'Invoice generated', orderNumber: order.orderNumber });
  } catch (err) {
    next(err);
  }
});

router.get('/:orderNumber/invoice/download', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let filepath = order.invoicePath || getInvoicePath(order.orderNumber);

    if (!fs.existsSync(filepath)) {
      filepath = await generateInvoice(order);
      order.invoicePath = filepath;
      await order.save();
    }

    res.download(filepath, `${order.orderNumber}.pdf`);
  } catch (err) {
    next(err);
  }
});

export default router;
