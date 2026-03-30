import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { API_BASE_URL, getMediaUrl } from '../utils/api';

const Checkout = () => {
  const { cart, user, token, clearCart } = useStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '', country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate]);

  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;

  const handlePayment = async () => {
    if (!address.street || !address.city || !address.state || !address.zip) {
      setErrorMsg("Please fill in all address related fields before proceeding.");
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const formattedItems = cart.map(item => ({
      productId: item.product._id,
      title: item.product.title,
      color: item.variant.color,
      size: item.variant.size,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.variants[0]?.imageUrl
    }));

    if (paymentMethod === 'cod') {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/orders`, {
          customerName: user.name,
          customerEmail: user.email,
          items: formattedItems,
          totalAmount,
          shippingAddress: address
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        if (res.data.success) {
          clearCart();
          navigate(`/order-success?id=${res.data.orderId}`);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to place COD order. " + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Create Razorpay order on our backend
      const res = await axios.post(`${API_BASE_URL}/api/payments/create-order`, {
        amount: totalAmount
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { order } = res.data;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Fetched from frontend env
        amount: order.amount,
        currency: order.currency,
        name: 'Glamire Fashion',
        description: 'Test Transaction',
        image: '/logo.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify payment signature and place final order
            const verifyRes = await axios.post(`${API_BASE_URL}/api/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                userId: user._id,
                customerName: user.name,
                customerEmail: user.email,
                totalAmount,
                items: formattedItems,
                shippingAddress: address
              }
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (verifyRes.data.success) {
               clearCart();
               navigate(`/order-success?id=${verifyRes.data.orderId}`);
            }
          } catch (err) {
            console.error(err);
            setErrorMsg("Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#523d38' // premium-900
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
         setErrorMsg(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  // Add Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-premium-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-4xl font-serif text-premium-900 mb-10 border-b border-premium-200 pb-6">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 rounded-sm shadow-sm border border-premium-100">
              <h2 className="text-2xl font-serif text-premium-900 mb-6 tracking-wide">Shipping Address</h2>
              
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-sm text-sm mb-6 border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-premium-700 mb-2">Street Address</label>
                  <input 
                    type="text" 
                    value={address.street} 
                    onChange={e => setAddress({...address, street: e.target.value})}
                    className="w-full border border-premium-200 p-3 rounded-sm focus:outline-none focus:border-premium-900" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-premium-700 mb-2">City</label>
                    <input 
                      type="text" 
                      value={address.city} 
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="w-full border border-premium-200 p-3 rounded-sm focus:outline-none focus:border-premium-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-premium-700 mb-2">State / Province</label>
                    <input 
                      type="text" 
                      value={address.state} 
                      onChange={e => setAddress({...address, state: e.target.value})}
                      className="w-full border border-premium-200 p-3 rounded-sm focus:outline-none focus:border-premium-900" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-premium-700 mb-2">ZIP / Postal Code</label>
                    <input 
                      type="text" 
                      value={address.zip} 
                      onChange={e => setAddress({...address, zip: e.target.value})}
                      className="w-full border border-premium-200 p-3 rounded-sm focus:outline-none focus:border-premium-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-premium-700 mb-2">Country</label>
                    <input 
                      type="text" 
                      value={address.country} 
                      disabled
                      className="w-full border border-premium-200 p-3 rounded-sm bg-premium-50 text-premium-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-sm shadow-sm border border-premium-100 mt-8">
              <h2 className="text-2xl font-serif text-premium-900 mb-6 tracking-wide">Payment Method</h2>
              <div className="space-y-4">
                <label className={`block border rounded-sm p-4 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-premium-900 bg-premium-50' : 'border-premium-200 hover:border-premium-400'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="razorpay" 
                      checked={paymentMethod === 'razorpay'} 
                      onChange={() => setPaymentMethod('razorpay')}
                      className="w-4 h-4 text-premium-900 focus:ring-premium-900 border-premium-300"
                    />
                    <div className="ml-3">
                      <span className="block font-medium text-premium-900">Pay Online</span>
                      <span className="block text-sm text-premium-500 mt-1">Cards, UPI, NetBanking, Wallets securely via Razorpay</span>
                    </div>
                  </div>
                </label>
                
                <label className={`block border rounded-sm p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-premium-900 bg-premium-50' : 'border-premium-200 hover:border-premium-400'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-premium-900 focus:ring-premium-900 border-premium-300"
                    />
                    <div className="ml-3">
                      <span className="block font-medium text-premium-900">Cash on Delivery</span>
                      <span className="block text-sm text-premium-500 mt-1">Pay with cash upon delivery.</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Setup Order summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 rounded-sm shadow-sm border border-premium-100 sticky top-28">
               <h2 className="text-xl font-serif text-premium-900 mb-6 border-b border-premium-100 pb-4 tracking-wide">Order Summary</h2>
               
               <div className="space-y-4 max-h-64 overflow-y-auto mb-6 custom-scrollbar pr-2">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex gap-4">
                     <div className="w-16 h-20 bg-premium-100 rounded-sm overflow-hidden border border-premium-100 flex-shrink-0">
                       <img src={getMediaUrl(item.product.variants && item.product.variants.length > 0 ? item.product.variants[0].imageUrl : '')} alt={item.product.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-medium text-premium-900 line-clamp-1">{item.product.title}</p>
                       <p className="text-xs text-premium-500 mt-1">{item.variant.color} | {item.variant.size}</p>
                       <div className="flex justify-between items-center mt-2 text-sm text-premium-700">
                         <span>Qty: {item.quantity}</span>
                         <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 text-sm text-premium-700 mb-6 border-t border-premium-100 pt-6">
                 <div className="flex justify-between">
                   <span>Subtotal</span>
                   <span>₹{subtotal.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Tax (18%)</span>
                   <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Shipping</span>
                   <span>Free</span>
                 </div>
               </div>

               <div className="border-t border-premium-200 pt-6 mb-8 flex justify-between items-end">
                  <span className="font-medium text-premium-900">Total</span>
                  <span className="text-2xl font-serif text-premium-900 font-bold tracking-tight">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
               </div>

               <button 
                 onClick={handlePayment} 
                 disabled={loading}
                 className="w-full btn-primary py-4 block text-center tracking-widest text-sm flex justify-center items-center"
               >
                 {loading ? 'PROCESSING...' : (paymentMethod === 'cod' ? 'PLACE ORDER (COD)' : 'PAY NOW')}
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
