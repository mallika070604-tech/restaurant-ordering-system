export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const CATEGORY_LABELS = {
  starters: 'Starters',
  mains: 'Main Course',
  desserts: 'Desserts',
  beverages: 'Beverages',
  specials: "Chef's Specials",
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  confirmed: 'bg-blue-500/20 text-blue-300',
  preparing: 'bg-orange-500/20 text-orange-300',
  ready: 'bg-emerald-500/20 text-emerald-300',
  served: 'bg-slate-500/20 text-slate-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

export const TAX_RATE = 0.05;

export const calcTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
};
