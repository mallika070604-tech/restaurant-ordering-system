import { Router } from 'express';
import Table from '../models/Table.js';
import { adminAuth } from '../middleware/auth.js';
import { generateTableQR, generateTableQRBuffer } from '../services/qrService.js';

const router = Router();

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/', async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    next(err);
  }
});

router.get('/:number', async (req, res, next) => {
  try {
    const table = await Table.findOne({ number: Number(req.params.number), isActive: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (err) {
    next(err);
  }
});

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { number, capacity = 4 } = req.body;
    if (!number) return res.status(400).json({ error: 'Table number is required' });

    const qrCode = await generateTableQR(number, getClientUrl());
    const table = await Table.create({ number, capacity, qrCode });
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
});

router.get('/:number/qr', async (req, res, next) => {
  try {
    const table = await Table.findOne({ number: Number(req.params.number) });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    const buffer = await generateTableQRBuffer(table.number, getClientUrl());
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', adminAuth, async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json({ message: 'Table deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
