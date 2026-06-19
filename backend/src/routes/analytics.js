import { Router } from 'express';
import Order from '../models/Order.js';
import { adminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/summary', adminAuth, async (req, res, next) => {
  try {
    const { period = 'today' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const matchStage = {
      paymentStatus: 'paid',
      createdAt: { $gte: startDate },
    };

    const [summary, byCategory, byDay, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
            totalTax: { $sum: '$tax' },
          },
        },
      ]),
      Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find({ paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber tableNumber total paymentMethod createdAt'),
    ]);

    const stats = summary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalTax: 0,
    };

    res.json({
      period,
      ...stats,
      topItems: byCategory,
      revenueByDay: byDay,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
