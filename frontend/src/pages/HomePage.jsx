import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';


export default function HomePage() {
const navigate = useNavigate();

return (
<Layout
title="Restaurant Ordering System"
subtitle="Scan QR, Order Food & Manage Restaurant"
actions={
  <Link
    to="/staff"
    className="text-sm text-slate-400 hover:text-white"
  >
    Staff Login
  </Link>
}
>
  
   <div className="max-w-4xl mx-auto">

```
    <div className="grid gap-6 md:grid-cols-2">

      <Link
        to="/order/1"
        className="card group p-6 transition hover:border-brand-500/40"
      >
        <span className="text-4xl">🍽️</span>

        <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-400">
          Customer Ordering
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Scan QR code, browse menu, add items to cart and place orders.
        </p>

        <p className="mt-4 text-sm text-brand-400">
          Start Ordering →
        </p>
      </Link>

      <div
        onClick={() => navigate('/staff')}
        className="card group p-6 cursor-pointer transition hover:border-brand-500/40"
      >
        <span className="text-4xl">👨‍💼</span>

        <h2 className="mt-4 font-display text-xl font-bold group-hover:text-brand-400">
          Staff Portal
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Access Kitchen Dashboard and Admin Panel securely.
        </p>

        <p className="mt-4 text-sm text-brand-400">
          Staff Login →
        </p>
      </div>

    </div>

  </div>
</Layout>)
}