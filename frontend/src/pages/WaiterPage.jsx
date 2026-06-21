import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function WaiterPage() {
  const [calls, setCalls] = useState([]);

  const playSound = () => {
    const audio = new Audio(
      'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    );

    audio.play().catch(() => {});
  };

  const loadCalls = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/waiter`
      );

      const data = await response.json();

      // New call vachinappudu sound play cheyyi
      if (data.length > calls.length) {
        playSound();
      }

      setCalls(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveCall = async (id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || ''}/waiter/${id}`,
        {
          method: 'PATCH',
        }
      );

      loadCalls();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCalls();

    const interval = setInterval(() => {
      loadCalls();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      title="Waiter Dashboard"
      subtitle="Customer assistance requests"
    >
      <div className="space-y-4">
        {calls.length === 0 ? (
          <div className="card p-6 text-center">
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