# Restaurant Ordering System

A production-ready full-stack restaurant ordering platform with QR-based table ordering, real-time kitchen updates, Razorpay payments, and PDF invoicing.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Socket.io Client |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB Atlas |
| Payments | Razorpay |
| Invoices | PDFKit |

## Features

- **QR code per table** — Unique QR linking to `/order/:tableNumber`
- **Menu management** — Admin CRUD with availability toggles
- **Cart & ordering** — Add items, notes, tax calculation
- **Kitchen dashboard** — Live kanban-style order queue with sound alerts
- **Real-time updates** — Socket.io for order status and payments
- **Revenue dashboard** — Today/week/month/year analytics
- **Razorpay integration** — Online payments with signature verification
- **PDF invoices** — Auto-generated on successful payment

## Project Structure

```
restaurant-ordering-system/
├── backend/
│   ├── src/
│   │   ├── config/       # DB & Razorpay
│   │   ├── models/       # Table, MenuItem, Order
│   │   ├── routes/       # REST API routes
│   │   ├── services/     # QR & invoice generation
│   │   ├── middleware/   # Admin auth
│   │   ├── server.js     # Express + Socket.io
│   │   └── seed.js       # Sample data
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/        # Home, Order, Kitchen, Admin
    │   ├── components/
    │   ├── context/      # Cart state
    │   └── api/          # API client
    └── .env.example
```

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for dev)
3. Copy the connection string

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, Razorpay keys, and admin PIN

npm install
npm run seed    # Seeds menu + 8 tables with QR codes
npm run dev     # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # Starts on http://localhost:5173
```

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | Frontend URL for CORS & QR links |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `ADMIN_PIN` | Staff PIN for admin routes (default: 1234) |
| `RESTAURANT_NAME` | Used on invoices |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Socket.io server URL |

## Usage

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/order/:tableNumber` | Customer ordering (QR destination) |
| `/kitchen` | Kitchen staff dashboard |
| `/admin` | Menu, tables, revenue (PIN required) |

### Customer Flow

1. Scan table QR → opens menu for that table
2. Add items to cart → Place order
3. Pay via Razorpay or mark cash at counter
4. Download PDF invoice after payment

### Kitchen Flow

1. Open `/kitchen` on a tablet
2. New orders appear in real time with sound alert
3. Move orders: New → Preparing → Ready → Served

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu` | — | List menu items |
| POST | `/api/menu` | PIN | Create menu item |
| GET | `/api/tables` | — | List tables |
| POST | `/api/tables` | PIN | Create table + QR |
| POST | `/api/orders` | — | Place order |
| PATCH | `/api/orders/:id/status` | PIN | Update order status |
| POST | `/api/payments/create-order` | — | Create Razorpay order |
| POST | `/api/payments/verify` | — | Verify payment |
| GET | `/api/analytics/summary` | PIN | Revenue stats |

Admin routes require header: `x-admin-pin: <your-pin>`

## Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Use **Test Mode** keys for development
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to backend `.env`
4. The frontend loads Razorpay checkout automatically

## Production Deployment

1. Set `CLIENT_URL` to your production frontend domain
2. Use MongoDB Atlas with IP allowlist for your server
3. Switch to Razorpay live keys
4. Build frontend: `npm run build` and serve via CDN/nginx
5. Run backend with a process manager (PM2, Docker, etc.)
6. Enable HTTPS for Razorpay and secure cookies

## License

MIT
