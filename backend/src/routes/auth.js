import { Router } from 'express';
import { verifyAdminPin } from '../utils/helpers.js';

const router = Router();

router.post('/login', (req, res) => {
  const { pin } = req.body;
  if (!pin || !verifyAdminPin(pin)) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  res.json({ success: true });
});

export default router;
