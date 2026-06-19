import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import OrderCard from '../components/OrderCard';
import { auth, orders, setAdminPin } from '../api/client';
import { useSocket } from '../hooks/useSocket';

export default function KitchenPage() {
  const [pin, setPin] = useState(sessionStorage.getItem('staffPin') || '');
  const [authenticated, setAuthenticated] = useState(Boolean(sessionStorage.getItem('staffPin')));
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('staffPin');
    if (stored) setAdminPin(stored);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await orders.active();
      setActiveOrders(data);
    } catch {
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadOrders();
  }, [authenticated, loadOrders]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await auth.login(pin);
      setAdminPin(pin);
      sessionStorage.setItem('staffPin', pin);
      setAuthenticated(true);
    } catch {
      setLoginError('Invalid staff PIN');
    }
  };

  const playChime = () => {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const { joinKitchen } = useSocket({
    onOrderCreated: (order) => {
      setActiveOrders((prev) => [...prev, order]);
      playChime();
    },
    onOrderUpdated: (order) => {
      setActiveOrders((prev) => {
        if (['served', 'cancelled'].includes(order.status)) {
          return prev.filter((o) => o._id !== order._id);
        }
        const idx = prev.findIndex((o) => o._id === order._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = order;
          return next;
        }
        return [...prev, order];
      });
    },
  });

  useEffect(() => {
    if (authenticated) joinKitchen();
  }, [authenticated, joinKitchen]);

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await orders.updateStatus(id, status);
      setActiveOrders((prev) => {
        if (['served', 'cancelled'].includes(status)) {
          return prev.filter((o) => o._id !== id);
        }
        return prev.map((o) => (o._id === id ? data : o));
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const columns = {
    pending: activeOrders.filter((o) => ['pending', 'confirmed'].includes(o.status)),
    preparing: activeOrders.filter((o) => o.status === 'preparing'),
    ready: activeOrders.filter((o) => o.status === 'ready'),
  };

  if (!authenticated) {
    return (
      <Layout title="Kitchen Login" subtitle="Enter staff PIN">
        <form onSubmit={handleLogin} className="card mx-auto max-w-sm p-6">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input mb-4"
            placeholder="Staff PIN"
          />
          {loginError && <p className="mb-3 text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="btn-primary w-full">
            Enter Kitchen
          </button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout
      title="Kitchen Dashboard"
      subtitle="Live order queue"
      actions={
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="rounded"
          />
          Sound alerts
        </label>
      }
    >
      {loading ? (
        <p className="text-center text-slate-400">Loading orders...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { key: 'pending', label: 'New Orders', items: columns.pending },
            { key: 'preparing', label: 'Preparing', items: columns.preparing },
            { key: 'ready', label: 'Ready to Serve', items: columns.ready },
          ].map((col) => (
            <section key={col.key} className="card p-4">
              <h2 className="mb-4 flex items-center justify-between font-display text-lg font-bold">
                {col.label}
                <span className="rounded-full bg-brand-600/20 px-2.5 py-0.5 text-sm text-brand-400">
                  {col.items.length}
                </span>
              </h2>
              <div className="space-y-3">
                {col.items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No orders</p>
                ) : (
                  col.items.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      showActions
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}
