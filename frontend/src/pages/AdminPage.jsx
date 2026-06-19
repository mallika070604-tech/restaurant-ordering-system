import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { setAdminPin, auth, menu, tables, analytics } from '../api/client';
import { formatCurrency, formatDateTime, CATEGORY_LABELS } from '../utils/format';

const emptyMenuForm = {
  name: '',
  description: '',
  price: '',
  category: 'mains',
  prepTimeMinutes: 15,
  isAvailable: true,
};

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState('revenue');
  const [menuItems, setMenuItems] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [period, setPeriod] = useState('today');
  const [menuForm, setMenuForm] = useState(emptyMenuForm);
  const [editingId, setEditingId] = useState(null);
  const [newTableNum, setNewTableNum] = useState('');
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    try {
      const [menuRes, tablesRes, revenueRes] = await Promise.all([
        menu.list(),
        tables.list(),
        analytics.summary(period),
      ]);
      setMenuItems(menuRes.data);
      setTableList(tablesRes.data);
      setRevenue(revenueRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    }
  }, [period]);

  useEffect(() => {
    if (authenticated) loadAll();
  }, [authenticated, loadAll]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await auth.login(pin);
      setAdminPin(pin);
      setAuthenticated(true);
    } catch {
      setError('Invalid admin PIN');
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...menuForm,
      price: Number(menuForm.price),
      prepTimeMinutes: Number(menuForm.prepTimeMinutes),
    };
    try {
      if (editingId) {
        await menu.update(editingId, payload);
      } else {
        await menu.create(payload);
      }
      setMenuForm(emptyMenuForm);
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save menu item');
    }
  };

  const handleEditMenu = (item) => {
    setEditingId(item._id);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      prepTimeMinutes: item.prepTimeMinutes,
      isAvailable: item.isAvailable,
    });
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    await menu.remove(id);
    loadAll();
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    await menu.toggleAvailability(id, isAvailable);
    loadAll();
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await tables.create({ number: Number(newTableNum), capacity: 4 });
      setNewTableNum('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create table');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Delete this table?')) return;
    await tables.remove(id);
    loadAll();
  };

  if (!authenticated) {
    return (
      <Layout title="Admin Login" subtitle="Enter staff PIN to continue">
        <form onSubmit={handleLogin} className="card mx-auto max-w-sm p-6">
          <label className="mb-2 block text-sm text-slate-400">Admin PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input mb-4"
            placeholder="Enter PIN"
          />
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </Layout>
    );
  }

  const tabs = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'menu', label: 'Menu' },
    { id: 'tables', label: 'Tables & QR' },
  ];

  return (
    <Layout title="Admin Panel" subtitle="Manage your restaurant">
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.id ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && revenue && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {['today', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
                  period === p ? 'bg-brand-600' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(revenue.totalRevenue) },
              { label: 'Orders', value: revenue.totalOrders },
              { label: 'Avg Order Value', value: formatCurrency(revenue.avgOrderValue || 0) },
              { label: 'Tax Collected', value: formatCurrency(revenue.totalTax) },
            ].map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-brand-400">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg font-bold">Top Items</h3>
              <ul className="space-y-2">
                {revenue.topItems?.map((item) => (
                  <li key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item._id} <span className="text-slate-500">×{item.quantity}</span>
                    </span>
                    <span className="text-brand-400">{formatCurrency(item.revenue)}</span>
                  </li>
                ))}
                {!revenue.topItems?.length && (
                  <li className="text-sm text-slate-500">No sales data yet</li>
                )}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg font-bold">Recent Paid Orders</h3>
              <ul className="space-y-2">
                {revenue.recentOrders?.map((order) => (
                  <li key={order._id} className="flex justify-between text-sm">
                    <span>
                      {order.orderNumber} · T{order.tableNumber}
                    </span>
                    <span className="text-slate-400">{formatDateTime(order.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item._id} className="border-b border-white/5">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-slate-400">{CATEGORY_LABELS[item.category]}</td>
                    <td className="p-3">{formatCurrency(item.price)}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item._id, !item.isAvailable)}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          item.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                    </td>
                    <td className="p-3">
                      <button type="button" className="mr-2 text-brand-400" onClick={() => handleEditMenu(item)}>
                        Edit
                      </button>
                      <button type="button" className="text-red-400" onClick={() => handleDeleteMenu(item._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleMenuSubmit} className="card h-fit p-5">
            <h3 className="mb-4 font-display text-lg font-bold">
              {editingId ? 'Edit Item' : 'Add Menu Item'}
            </h3>
            <div className="space-y-3">
              <input
                className="input"
                placeholder="Name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                required
              />
              <textarea
                className="input min-h-[80px]"
                placeholder="Description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              />
              <input
                className="input"
                type="number"
                placeholder="Price"
                value={menuForm.price}
                onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                required
              />
              <select
                className="input"
                value={menuForm.category}
                onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                placeholder="Prep time (min)"
                value={menuForm.prepTimeMinutes}
                onChange={(e) => setMenuForm({ ...menuForm, prepTimeMinutes: e.target.value })}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update' : 'Add Item'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setMenuForm(emptyMenuForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {tab === 'tables' && (
        <div>
          <form onSubmit={handleAddTable} className="card mb-6 flex flex-wrap items-end gap-3 p-5">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Table Number</label>
              <input
                type="number"
                className="input w-32"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Add Table & Generate QR
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tableList.map((table) => (
              <div key={table._id} className="card p-4 text-center">
                <p className="font-display text-xl font-bold">Table {table.number}</p>
                <p className="text-sm text-slate-400">{table.capacity} seats</p>
                <img
                  src={table.qrCode}
                  alt={`QR for table ${table.number}`}
                  className="mx-auto my-4 w-40 rounded-lg bg-white p-2"
                />
                <a
                  href={tables.qrUrl(table.number)}
                  download={`table-${table.number}-qr.png`}
                  className="btn-secondary mb-2 block text-xs"
                >
                  Download QR PNG
                </a>
                <button
                  type="button"
                  className="text-xs text-red-400"
                  onClick={() => handleDeleteTable(table._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
