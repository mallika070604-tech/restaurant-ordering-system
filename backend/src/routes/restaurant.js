import { Router } from 'express';
import Restaurant from '../models/Restaurant.js';

const router = Router();

router.get('/', async (req, res) => {
  let restaurant = await Restaurant.findOne();

  if (!restaurant) {
    restaurant = await Restaurant.create({
      name: 'The Golden Fork',
      address: '123 Main Street',
      phone: '+91 9876543210',
      logo: '',
    });
  }

  res.json(restaurant);
});

router.put('/', async (req, res) => {
  let restaurant = await Restaurant.findOne();

  if (!restaurant) {
    restaurant = await Restaurant.create(req.body);
  } else {
    Object.assign(restaurant, req.body);
    await restaurant.save();
  }

  res.json(restaurant);
});

export default router;