import { STATUS_COLORS, formatCurrency, formatDateTime } from '../utils/format';

export default function OrderCard({ order, onStatusChange, showActions = false }) {
  return (
    <article className="card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold">{order.orderNumber}</p>
          <p className="text-sm text-slate-400">
            Table {order.tableNumber} · {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS_COLORS[order.status]}`}>
          {order.status}
        </span>
      </div>

      <ul className="mb-3 space-y-1 text-sm">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex justify-between text-slate-300">
            <span>
              {item.quantity}× {item.name}
              {item.notes && <span className="text-slate-500"> — {item.notes}</span>}
            </span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <span className="font-bold text-brand-400">{formatCurrency(order.total)}</span>
        <span className="text-xs uppercase text-slate-500">{order.paymentStatus}</span>
      </div>

      {showActions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {order.status === 'pending' && (
            <button type="button" className="btn-primary text-xs" onClick={() => onStatusChange(order._id, 'preparing')}>
              Start Preparing
            </button>
          )}
          {order.status === 'confirmed' && (
            <button type="button" className="btn-primary text-xs" onClick={() => onStatusChange(order._id, 'preparing')}>
              Start Preparing
            </button>
          )}
          {order.status === 'preparing' && (
            <button type="button" className="btn-primary text-xs" onClick={() => onStatusChange(order._id, 'ready')}>
              Mark Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button type="button" className="btn-secondary text-xs" onClick={() => onStatusChange(order._id, 'served')}>
              Mark Served
            </button>
          )}
        </div>
      )}
    </article>
  );
}
