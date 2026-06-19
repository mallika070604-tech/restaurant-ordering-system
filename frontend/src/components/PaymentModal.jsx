import { useState } from 'react';
import { payments } from '../api/client';
import { formatCurrency } from '../utils/format';

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRazorpay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: config } = await payments.config();
      if (!config.configured) {
        setError('Razorpay is not configured. Use cash payment or set API keys.');
        setLoading(false);
        return;
      }

      const { data: rpOrder } = await payments.createRazorpayOrder(order._id);

      const options = {
        key: config.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'The Golden Fork',
        description: `Order ${order.orderNumber}`,
        order_id: rpOrder.razorpayOrderId,
        handler: async (response) => {
          try {
            const { data } = await payments.verify({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess(data.order);
          } catch (err) {
            setError(err.response?.data?.error || 'Payment verification failed');
          }
        },
        theme: { color: '#ea580c' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCash = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await payments.markCashPaid(order._id);
      onSuccess(data.order);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-2xl font-bold">Complete Payment</h2>
        <p className="mt-1 text-slate-400">Order {order.orderNumber}</p>
        <p className="mt-4 text-3xl font-bold text-brand-400">{formatCurrency(order.total)}</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <div className="mt-6 space-y-3">
          <button type="button" className="btn-primary w-full py-3" onClick={handleRazorpay} disabled={loading}>
            Pay with Razorpay
          </button>
          <button type="button" className="btn-secondary w-full py-3" onClick={handleCash} disabled={loading}>
            Pay Cash at Counter
          </button>
          <button type="button" className="w-full py-2 text-sm text-slate-400 hover:text-white" onClick={onClose}>
            Pay later
          </button>
        </div>
      </div>
    </div>
  );
}
