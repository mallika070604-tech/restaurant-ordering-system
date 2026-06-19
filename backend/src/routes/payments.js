import { Router } from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { getRazorpay, isRazorpayConfigured } from '../config/razorpay.js';
import { verifyRazorpaySignature } from '../utils/helpers.js';
import { generateInvoice } from '../services/invoiceService.js';

const router = Router();

router.get('/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || '',
    configured: isRazorpayConfigured(),
  });
});

router.post('/create-order', async (req, res, next) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        tableNumber: String(order.tableNumber),
        orderId: order._id.toString(),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = 'pending';
    order.paymentMethod = 'razorpay';
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = order.status === 'pending' ? 'confirmed' : order.status;

    const invoicePath = await generateInvoice(order);
    order.invoicePath = invoicePath;
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('order:updated', order);
      io.to('kitchen').emit('order:updated', order);
      io.emit('payment:success', { orderId: order._id, orderNumber: order.orderNumber });
    }

    res.json({
      success: true,
      order,
      invoiceUrl: `/api/orders/${order.orderNumber}/invoice/download`,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/cash/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentMethod = 'cash';
    order.status = order.status === 'pending' ? 'confirmed' : order.status;

    const invoicePath = await generateInvoice(order);
    order.invoicePath = invoicePath;
    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('order:updated', order);

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

export default router;
