import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function WaiterPage() {
  const [calls, setCalls] = useState([]);

  const loadCalls = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/waiter`
      );

      const data = await response.json();
      setCalls(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveCall = async (id) => {
    await fetch(
      `${import.meta.env.VITE_API_URL || ''}/waiter/${id}`,
      {
        method: 'PATCH',
      }
    );

    loadCalls();
  };

  useEffect(() => {
    loadCalls();

    const interval = setInterval(loadCalls, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      title="Waiter Dashboard"
      subtitle="Customer assistance requests"
    >
      <div className="space-y-4">
        {calls.length === 0 ? (
          <div className="card p-6">
            No waiter calls
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call._id}
              className="card flex items-center justify-between p-5"
            >
              <div>
                <h3 className="text-xl font-bold">
                  🔔 Table {call.tableNumber}
                </h3>

                <p className="text-slate-400">
                  Customer is calling waiter
                </p>
              </div>

              <button
                onClick={() => resolveCall(call._id)}
                className="btn-primary"
              >
                Resolve
              </button>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}