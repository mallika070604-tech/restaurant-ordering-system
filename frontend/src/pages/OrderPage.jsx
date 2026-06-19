import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import MenuCard from '../components/MenuCard';
import CartPanel from '../components/CartPanel';
import PaymentModal from '../components/PaymentModal';
import OrderCard from '../components/OrderCard';
import { CartProvider, useCart } from '../context/CartContext';
import { menu, orders, tables } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { CATEGORY_LABELS } from '../utils/format';

function OrderContent() {
  const { tableNumber } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [tableOrders, setTableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error, setError] = useState('');
  const { addItem, clearCart, items, customerNotes } = useCart();

  const loadData = useCallback(async () => {
    try {
      const [menuRes, ordersRes] = await Promise.all([
        menu.list({ available: true }),
        orders.byTable(tableNumber),
      ]);
      setMenuItems(menuRes.data);
      setTableOrders(ordersRes.data);
    } catch {
      setError('Could not load menu. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [tableNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { joinTable } = useSocket({
    onOrderUpdated: (order) => {
      if (String(order.tableNumber) === String(tableNumber)) {
        setTableOrders((prev) => {
          const idx = prev.findIndex((o) => o._id === order._id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = order;
            return next;
          }
          return [order, ...prev];
        });
      }
    },
    onPaymentSuccess: () => loadData(),
  });

  useEffect(() => {
    joinTable(tableNumber);
  }, [tableNumber, joinTable]);

  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map((i) => i.category))];
    return ['all', ...cats];
  }, [menuItems]);

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? menuItems
        : menuItems.filter((i) => i.category === activeCategory),
    [menuItems, activeCategory]
  );

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const { data: table } = await tables.get(tableNumber);
      if (!table) throw new Error('Invalid table');

      const { data: order } = await orders.create({
        tableNumber: Number(tableNumber),
        items: items.map((i) => ({
          menuItemId: i._id,
          quantity: i.quantity,
          notes: i.notes,
        })),
        customerNotes,
      });

      clearCart();
      setPendingOrder(order);
      setTableOrders((prev) => [order, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = (order) => {
    setPendingOrder(null);
    setTableOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    if (order.orderNumber) {
      window.open(orders.downloadInvoice(order.orderNumber), '_blank');
    }
  };

  if (loading) {
    return (
      <Layout title={`Table ${tableNumber}`} subtitle="Loading menu...">
        <div className="flex justify-center py-20 text-slate-400">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title={`Table ${tableNumber}`} subtitle="Browse menu and place your order">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MenuCard key={item._id} item={item} onAdd={addItem} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <CartPanel onCheckout={handleCheckout} loading={checkoutLoading} />

          {tableOrders.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-lg font-bold">Your Orders</h2>
              <div className="space-y-3">
                {tableOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {pendingOrder && (
        <PaymentModal
          order={pendingOrder}
          onClose={() => setPendingOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Layout>
  );
}

export default function OrderPage() {
  const { tableNumber } = useParams();
  return (
    <CartProvider tableNumber={tableNumber}>
      <OrderContent />
    </CartProvider>
  );
}
