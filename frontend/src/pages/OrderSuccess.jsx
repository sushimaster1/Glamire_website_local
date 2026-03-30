import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { CheckCircle2, Package, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { API_BASE_URL, getMediaUrl } from '../utils/api';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useStore();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!orderId) { navigate('/'); return; }

    axios
      .get(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId, user, token, navigate]);

  const statusColor = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Shipped: 'bg-blue-100 text-blue-700 border-blue-200',
    Delivered: 'bg-green-100 text-green-700 border-green-200',
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-premium-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-premium-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success Hero */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-serif text-premium-900 mb-3">Order Confirmed!</h1>
          <p className="text-premium-500 text-lg">
            Thank you for your purchase. We'll get it to you soon.
          </p>
          {order && (
            <p className="mt-3 text-xs text-premium-400 font-mono tracking-wider">
              Order ID: #{order._id}
            </p>
          )}
        </div>

        {order ? (
          <div className="space-y-6">

            {/* Order Items */}
            <div className="bg-white border border-premium-100 rounded-sm shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '80ms' }}>
              <div className="px-6 py-4 border-b border-premium-100 flex items-center justify-between">
                <h2 className="font-serif text-premium-900 text-lg flex items-center gap-2">
                  <Package size={18} className="text-premium-600" /> Items Ordered
                </h2>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor[order.status] || statusColor.Pending}`}>
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-premium-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5 px-6 py-4">
                    <div className="w-16 h-20 bg-premium-100 rounded-sm overflow-hidden border border-premium-100 flex-shrink-0">
                      {item.image ? (
                        <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-premium-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-premium-900 text-sm leading-tight">{item.title}</p>
                      <p className="text-xs text-premium-500 mt-1">{item.color} · {item.size} · Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-premium-900 flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 bg-premium-50 border-t border-premium-100 space-y-2">
                <div className="flex justify-between text-sm text-premium-600">
                  <span>Subtotal</span>
                  <span>₹{(order.totalAmount / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-sm text-premium-600">
                  <span>GST (18%)</span>
                  <span>₹{(order.totalAmount - order.totalAmount / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-sm text-premium-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-serif text-premium-900 text-lg pt-2 border-t border-premium-200 mt-2">
                  <span>Total Paid</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white border border-premium-100 rounded-sm shadow-sm px-6 py-5 animate-slide-up" style={{ animationDelay: '160ms' }}>
                <h2 className="font-serif text-premium-900 text-lg flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-premium-600" /> Shipping To
                </h2>
                <p className="text-premium-700 text-sm leading-relaxed">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.zip}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Estimated Delivery */}
            <div className="bg-premium-900 text-white rounded-sm px-6 py-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
              <p className="text-xs tracking-widest uppercase text-premium-300 mb-1">Estimated Delivery</p>
              <p className="text-xl font-serif">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="text-sm text-premium-300 mt-1">Standard delivery · 4–6 business days</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '320ms' }}>
              <Link
                to="/shop"
                className="flex-1 text-center border border-premium-900 text-premium-900 py-4 rounded-sm hover:bg-premium-900 hover:text-white transition-all tracking-widest text-sm font-medium"
              >
                CONTINUE SHOPPING
              </Link>
              <Link
                to="/profile"
                className="flex-1 text-center btn-primary py-4 tracking-widest text-sm flex items-center justify-center gap-2"
              >
                VIEW MY ORDERS <ChevronRight size={16} />
              </Link>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-premium-100 rounded-sm">
            <p className="text-premium-500 mb-4">Order details not found.</p>
            <Link to="/" className="btn-primary">Go Home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
