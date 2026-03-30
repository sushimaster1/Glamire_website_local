import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';
import { getMediaUrl } from '../utils/api';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST example
  const total = subtotal + tax;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-premium-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-4xl font-serif text-premium-900 mb-2">Shopping Bag</h1>
        <p className="text-premium-500 mb-10">{cart.length} items in your bag</p>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-premium-100 rounded-sm shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-premium-300 mb-6" />
            <h2 className="text-2xl font-serif text-premium-900 mb-2">Your bag is empty</h2>
            <p className="text-premium-500 mb-8">Looks like you haven't added anything to your bag yet.</p>
            <Link to="/shop" className="btn-primary">CONTINUE SHOPPING</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white border border-premium-100 rounded-sm shadow-sm divide-y divide-premium-100">
                {cart.map((item, index) => (
                  <div key={`${item.product._id}-${item.variant.color}-${item.variant.size}-${index}`} className="flex flex-col sm:flex-row p-6 items-center">
                    
                    <div className="w-24 h-32 flex-shrink-0 bg-premium-100 rounded-sm overflow-hidden border border-premium-100 mb-4 sm:mb-0">
                       <img src={getMediaUrl(item.product.variants && item.product.variants.length > 0 ? item.product.variants[0].imageUrl : '')} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="sm:ml-6 flex-1 w-full text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row justify-between mb-2">
                         <h3 className="text-lg font-serif text-premium-900 leading-tight">
                           <Link to={`/product/${item.product._id}`} className="hover:text-premium-600 transition-colors">
                             {item.product.title}
                           </Link>
                         </h3>
                         <p className="text-lg font-medium text-premium-900 mt-2 sm:mt-0">₹{item.product.price.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <p className="text-sm text-premium-500 mb-4">
                        Color: {item.variant.color} | Size: {item.variant.size}
                      </p>

                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex border border-premium-300 w-28 rounded-sm items-center text-premium-900">
                           <button onClick={() => updateCartQuantity(item.product._id, item.variant.color, item.variant.size, Math.max(1, item.quantity - 1))} className="px-3 py-1.5 hover:bg-premium-100 transition-colors">-</button>
                           <span className="flex-1 text-center font-medium pr-1 text-sm">{item.quantity}</span>
                           <button onClick={() => updateCartQuantity(item.product._id, item.variant.color, item.variant.size, item.quantity + 1)} className="px-3 py-1.5 hover:bg-premium-100 transition-colors">+</button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.product._id, item.variant.color, item.variant.size)}
                          className="text-premium-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-8 border border-premium-100 rounded-sm shadow-sm sticky top-28">
                 <h2 className="text-xl font-serif text-premium-900 mb-6 border-b border-premium-100 pb-4">Order Summary</h2>
                 
                 <div className="space-y-4 text-premium-700 mb-6">
                   <div className="flex justify-between">
                     <span>Subtotal</span>
                     <span>₹{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Estimated Tax (GST 18%)</span>
                     <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Shipping</span>
                     <span className="text-green-600 font-medium">Free</span>
                   </div>
                 </div>

                 <div className="border-t border-premium-100 pt-6 mb-8 flex justify-between items-end">
                    <span className="text-lg font-medium text-premium-900">Total</span>
                    <span className="text-2xl font-serif text-premium-900 font-bold">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                 </div>

                 <Link to="/checkout" className="w-full btn-primary py-4 block text-center tracking-widest shadow-md hover:shadow-lg transition-all text-sm mb-4">
                   PROCEED TO CHECKOUT
                 </Link>
                 
                 <div className="text-center text-xs text-premium-400">
                   Secure Checkout by Razorpay. 
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
