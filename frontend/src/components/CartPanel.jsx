import { formatCurrency } from '../utils/format';
import { useCart } from '../context/CartContext';

export default function CartPanel({ onCheckout, loading }) {
  const {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    customerNotes,
    updateQty,
    removeItem,
    updateNotes,
    setCustomerNotes,
  } = useCart();

  if (!itemCount) {
    return (
      <div className="card p-6 text-center text-slate-400">
        <p className="text-lg">Your cart is empty</p>
        <p className="mt-1 text-sm">Browse the menu and add items to get started.</p>
      </div>
    );
  }

  return (
    <div className="card sticky top-24 p-5">
      <h2 className="mb-4 font-display text-xl font-bold">Your Order</h2>
      <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item._id} className="rounded-xl bg-slate-800/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-400">{formatCurrency(item.price)} each</p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item._id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQty(item._id, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-lg"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQty(item._id, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-lg"
              >
                +
              </button>
              <span className="ml-auto font-semibold text-brand-400">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
            <input
              type="text"
              placeholder="Special instructions..."
              value={item.notes}
              onChange={(e) => updateNotes(item._id, e.target.value)}
              className="input mt-2 text-xs"
            />
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Tax (5%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-brand-400">{formatCurrency(total)}</span>
        </div>
      </div>

      <textarea
        placeholder="Notes for the kitchen (optional)"
        value={customerNotes}
        onChange={(e) => setCustomerNotes(e.target.value)}
        className="input mt-4 min-h-[72px] resize-none"
      />

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading}
        className="btn-primary mt-4 w-full py-3"
      >
        {loading ? 'Placing order...' : 'Place Order & Pay'}
      </button>
    </div>
  );
}
