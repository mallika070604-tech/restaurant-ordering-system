import express from 'express';
import WaiterCall from '../models/WaiterCall.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { tableNumber } = req.body;

  const call = await WaiterCall.create({
    tableNumber,
  });

  req.app.get('io').to('kitchen').emit('waiter:call', call);

  res.json(call);
});

router.get('/', async (req, res) => {
  const calls = await WaiterCall.find({
    status: 'pending',
  }).sort({ createdAt: -1 });

  res.json(calls);
});

router.patch('/:id', async (req, res) => {
  const call = await WaiterCall.findByIdAndUpdate(
    req.params.id,
    {
      status: 'resolved',
    },
    { new: true }
  );

  res.json(call);
});

export default router;