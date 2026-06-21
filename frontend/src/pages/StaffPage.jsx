import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function StaffPage() {
  return (
    <Layout
      title="Staff Portal"
      subtitle="Restaurant Management Dashboard"
    >
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">

        <Link
          to="/kitchen"
          className="card p-6 text-center transition hover:border-brand-500/40"
        >
          <div className="mb-3 text-4xl">👨‍🍳</div>
          <h2 className="font-display text-xl font-bold">
            Kitchen
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage incoming orders
          </p>
        </Link>

        <Link
          to="/admin"
          className="card p-6 text-center transition hover:border-brand-500/40"
        >
          <div className="mb-3 text-4xl">📊</div>
          <h2 className="font-display text-xl font-bold">
            Admin
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Revenue & menu management
          </p>
        </Link>

        <Link
          to="/waiter"
          className="card p-6 text-center transition hover:border-brand-500/40"
        >
          <div className="mb-3 text-4xl">🔔</div>
          <h2 className="font-display text-xl font-bold">
            Waiter
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Customer assistance requests
          </p>
        </Link>

      </div>
    </Layout>
  );
}