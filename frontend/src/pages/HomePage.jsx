import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <Layout
      title="Restaurant Ordering"
      subtitle="Scan a table QR code or open the staff dashboards"
      actions={<Navbar />}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/order/1" className="card group p-6 transition hover:border-brand-500/40">
          <span className="text-3xl">📱</span>
          <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-400">
            Customer Ordering
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Each table has a unique QR code linking to the digital menu, cart, and payment.
          </p>
          <p className="mt-4 text-sm text-brand-400">Demo: Table 1 →</p>
        </Link>

        <Link to="/kitchen" className="card group p-6 transition hover:border-brand-500/40">
          <span className="text-3xl">👨‍🍳</span>
          <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-400">
            Kitchen Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Real-time order queue with status updates for prep and service.
          </p>
          <p className="mt-4 text-sm text-brand-400">Open kitchen →</p>
        </Link>

        <Link to="/admin" className="card group p-6 transition hover:border-brand-500/40">
          <span className="text-3xl">📊</span>
          <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-400">
            Admin Panel
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage menu, tables, QR codes, and view revenue analytics.
          </p>
          <p className="mt-4 text-sm text-brand-400">Admin login →</p>
        </Link>
      </div>
    </Layout>
  );
}
