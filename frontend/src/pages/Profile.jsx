import { useEffect, useState } from 'react';
import axios from 'axios';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, User as UserIcon, ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getMediaUrl } from '../utils/api';

const statusConfig = {
    Pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    Shipped:   { label: 'Shipped',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    Delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-700 border-green-200' },
};

const Profile = () => {
    const { user, token, logout } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        axios
            .get(`${API_BASE_URL}/api/orders/my`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setOrders(res.data))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [user, token, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-premium-50 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10">
                
                {/* Sidebar */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-premium-100 text-center animate-slide-up">
                        <div className="w-24 h-24 mx-auto bg-premium-100 rounded-full flex items-center justify-center text-premium-900 mb-4 border border-premium-200 overflow-hidden">
                           {user.picture ? (
                             <img src={user.picture} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           ) : (
                             <UserIcon size={40} />
                           )}
                        </div>
                        <h2 className="text-xl font-serif text-premium-900 capitalize mb-1">{user.name}</h2>
                        <p className="text-premium-500 text-sm mb-2">{user.email}</p>
                        <p className="text-xs text-premium-400 mb-6 capitalize">{user.role}</p>
                        
                        <div className="space-y-1 text-left mb-8 border-t border-premium-100 pt-6">
                           <button
                             onClick={() => setActiveTab('orders')}
                             className={`w-full text-left px-4 py-2 rounded-sm font-medium flex items-center transition-colors ${
                               activeTab === 'orders' ? 'bg-premium-900 text-white' : 'text-premium-700 hover:bg-premium-50'
                             }`}
                           >
                              <Package size={18} className="mr-3" /> My Orders
                              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{orders.length}</span>
                           </button>
                           <button
                             onClick={() => setActiveTab('addresses')}
                             className={`w-full text-left px-4 py-2 rounded-sm flex items-center transition-colors ${
                               activeTab === 'addresses' ? 'bg-premium-900 text-white' : 'text-premium-700 hover:bg-premium-50'
                             }`}
                           >
                              <MapPin size={18} className="mr-3" /> Addresses
                           </button>
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full border border-premium-900 text-premium-900 py-2 rounded-sm hover:bg-premium-900 hover:text-white transition-colors text-sm"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-3/4">
                    {activeTab === 'orders' && (
                    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-serif text-premium-900 mb-6">My Orders</h2>

                        {loading ? (
                            <div className="space-y-4">
                                {[1,2].map(i => (
                                    <div key={i} className="bg-white border border-premium-100 rounded-sm p-6 animate-pulse">
                                        <div className="h-4 bg-premium-200 rounded w-1/3 mb-3" />
                                        <div className="h-3 bg-premium-100 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const cfg = statusConfig[order.status] || statusConfig.Pending;
                                    return (
                                        <div key={order._id} className="bg-white border border-premium-100 rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Order Header */}
                                            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-premium-50 gap-2">
                                                <div>
                                                    <p className="text-xs text-premium-400 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
                                                    <p className="text-xs text-premium-500 mt-0.5">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.cls}`}>
                                                        {cfg.label}
                                                    </span>
                                                    <span className="font-serif text-premium-900 font-bold">
                                                        ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="px-6 py-4 flex items-center gap-4">
                                                <div className="flex -space-x-3">
                                                    {order.items.slice(0, 3).map((item, i) => (
                                                        <div key={i} className="w-12 h-14 rounded-sm border-2 border-white bg-premium-100 overflow-hidden flex-shrink-0">
                                                            {item.image ? (
                                                                <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-premium-300">
                                                                    <ShoppingBag size={14} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="w-12 h-14 rounded-sm border-2 border-white bg-premium-200 flex items-center justify-center text-xs text-premium-600 font-medium flex-shrink-0">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-premium-900 font-medium truncate">
                                                        {order.items[0]?.title}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                                                    </p>
                                                    <p className="text-xs text-premium-500 mt-0.5">{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                                                </div>
                                                <Link
                                                    to={`/order-success?id=${order._id}`}
                                                    className="flex items-center gap-1 text-xs text-premium-600 hover:text-premium-900 transition-colors flex-shrink-0"
                                                >
                                                    Details <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white border border-premium-100 rounded-sm">
                                <Package size={48} className="mx-auto text-premium-300 mb-4" />
                                <h3 className="text-lg font-medium text-premium-900 mb-2">No orders yet</h3>
                                <p className="text-premium-500 mb-6">Start shopping and your orders will appear here.</p>
                                <Link to="/shop" className="btn-primary">BROWSE COLLECTION</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h2 className="text-2xl font-serif text-premium-900 mb-6">Saved Addresses</h2>
                        <div className="bg-white border border-premium-100 rounded-sm p-10 text-center">
                            <MapPin size={40} className="mx-auto text-premium-300 mb-3" />
                            <p className="text-premium-500">No saved addresses yet.</p>
                            <p className="text-xs text-premium-400 mt-1">Addresses are saved when you place an order.</p>
                        </div>
                    </div>
                )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
