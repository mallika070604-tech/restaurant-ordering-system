import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureInvoicesDir } from './services/invoiceService.js';


import authRoutes from './routes/auth.js';
import tableRoutes from './routes/tables.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';
import restaurantRoutes from './routes/restaurant.js';
import waiterRoutes from './routes/waiter.js';

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:kitchen', () => {
    socket.join('kitchen');
    console.log('Kitchen joined:', socket.id);
  });

  socket.on('join:table', (tableNumber) => {
    socket.join(`table:${tableNumber}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/api/waiter', waiterRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  ensureInvoicesDir();
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
