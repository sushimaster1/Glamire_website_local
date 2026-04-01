import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { BarChart3, PackageOpen, LayoutList, PlusCircle, Pencil, Trash2, Layers, Eye, EyeOff, Home, Menu, Upload } from 'lucide-react';
import AddProductForm from '../components/AddProductForm';
import { getMediaUrl, API_BASE_URL } from '../utils/api';

const SellerDashboard = () => {
    const { user, fetchCategories, fetchSettings, settings } = useStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders
    
    // States
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [collectionMeta, setCollectionMeta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeCollection, setActiveCollection] = useState(null);
    const [draftCollections, setDraftCollections] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sellerDraftCollections')) || []; }
        catch { return []; }
    });
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setIsAddingProduct(false);
        setEditingProduct(null);
        if (tab !== 'collections') setActiveCollection(null);
    };

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/');
            return;
        }
        
        const fetchData = async () => {
             setLoading(true);
             try {
                const headers = { Authorization: `Bearer ${user.token}` };
                if (activeTab === 'analytics') {
                   const { data } = await axios.get(`${API_BASE_URL}/api/seller/analytics`, { headers });
                   setAnalytics(data);
                } else if (activeTab === 'products') {
                   const { data } = await axios.get(`${API_BASE_URL}/api/products`);
                   setProducts(Object.values(data));
                 } else if (activeTab === 'collections') {
                    const [prodRes, metaRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/products`),
                        axios.get(`${API_BASE_URL}/api/products/categories/meta`, { headers })
                    ]);
                    setProducts(Object.values(prodRes.data));
                    setCollectionMeta(metaRes.data);
                 } else if (activeTab === 'orders') {
                   const { data } = await axios.get(`${API_BASE_URL}/api/seller/orders`, { headers });
                   setOrders(data);
                } else if (activeTab === 'settings') {
                    if (fetchSettings) fetchSettings();
                }
             } catch (err) {
                 console.error("Failed to fetch dashboard data", err);
             } finally {
                 setLoading(false);
             }
        };

        fetchData();
    }, [user, activeTab, navigate, fetchCategories]);

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/seller/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Refresh counts
            fetchAnalytics();
            // Update local state
            setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order? This will also update your revenue and order counts.")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/seller/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Refresh everything
            fetchOrders();
            fetchAnalytics();
        } catch (err) {
            console.error('Failed to delete order', err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProducts(products.filter(p => p._id !== productId));
            if (fetchCategories) fetchCategories();
        } catch (err) {
             console.error(err);
        }
    }

    const handleCreateCollection = () => {
        const name = window.prompt("Enter new collection name:");
        if (name && name.trim()) {
            const cleanName = name.trim();
            const updated = draftCollections.includes(cleanName)
                ? draftCollections
                : [...draftCollections, cleanName];
            setDraftCollections(updated);
            localStorage.setItem('sellerDraftCollections', JSON.stringify(updated));
            setActiveCollection(cleanName);
        }
    };

    const handleProductAdded = async () => {
        setIsAddingProduct(false);
        setEditingProduct(null);
        // Refresh products
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/products`);
            setProducts(Object.values(data));
            if (fetchCategories) fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const openProductPicker = async () => {
        setPickerSearch('');
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/products`);
            setAllProducts(Object.values(data));
        } catch (err) {
            console.error(err);
        }
        setShowProductPicker(true);
    };

    const handleAddProductToCollection = async (product) => {
        try {
            // Append the active collection to the current categories array
            const currentCategories = product.categories || [];
            if (currentCategories.includes(activeCollection)) return;
            
            const updatedCategories = [...currentCategories, activeCollection];
            
            await axios.put(
                `${API_BASE_URL}/api/products/${product._id}`,
                { categories: updatedCategories },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Refresh products list
            const { data } = await axios.get(`${API_BASE_URL}/api/products`);
            const updated = Object.values(data);
            setProducts(updated);
            setAllProducts(updated);
            if (fetchCategories) fetchCategories();
        } catch (err) {
            console.error('Failed to add product to collection', err);
        }
    };

    const handleRemoveProductFromCollection = async (product) => {
        if (!window.confirm(`Remove ${product.title} from ${activeCollection}?`)) return;
        try {
            const updatedCategories = (product.categories || []).filter(c => c !== activeCollection);
            await axios.put(
                `${API_BASE_URL}/api/products/${product._id}`,
                { categories: updatedCategories },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Refresh products list
            const { data } = await axios.get(`${API_BASE_URL}/api/products`);
            const updated = Object.values(data);
            setProducts(updated);
            setAllProducts(updated);
            if (fetchCategories) fetchCategories();
        } catch (err) {
            console.error('Failed to remove product from collection', err);
        }
    };

    const handleToggleVisibility = async (update) => {
        if (!activeCollection) return;
        try {
            const { data } = await axios.put(
                `${API_BASE_URL}/api/products/categories/${encodeURIComponent(activeCollection)}/visibility`,
                update,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            // Update local state
            setCollectionMeta(prev => {
                const existingIndex = prev.findIndex(m => m.name === activeCollection);
                if (existingIndex >= 0) {
                    const newMeta = [...prev];
                    newMeta[existingIndex] = data;
                    return newMeta;
                } else {
                    return [...prev, data];
                }
            });

            // Tell the Navbar to refresh its list
            if (fetchCategories) fetchCategories();
        } catch (err) {
            console.error('Failed to toggle visibility', err);
        }
    };

    const handleMediaUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            });

            const isVideo = file.type.startsWith('video/');
            handleToggleVisibility({ 
                imageUrl: data, 
                mediaType: isVideo ? 'video' : 'image' 
            });
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed. Images/Videos only.');
        }
    };

    const handleHeroUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data: uploadedUrl } = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            });

            const isVideo = file.type.startsWith('video/');
            await axios.post(`${API_BASE_URL}/api/settings`, {
                heroMediaUrl: uploadedUrl,
                heroMediaType: isVideo ? 'video' : 'image'
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (fetchSettings) fetchSettings();
        } catch (err) {
            console.error('Hero upload failed', err);
            alert('Upload failed.');
        }
    };

    if (!user || user.role !== 'seller') return null;

    return (
        <div className="min-h-screen pt-24 pb-20 bg-premium-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Menu */}
                <div className="w-full md:w-64 flex-shrink-0 animate-slide-up">
                    <div className="bg-white rounded-sm shadow-sm border border-premium-100 overflow-hidden sticky top-28">
                        <div className="p-6 bg-premium-900 text-white text-center">
                            <h2 className="text-xl font-serif tracking-widest">DASHBOARD</h2>
                            <p className="text-xs text-premium-300 mt-1 uppercase">Seller Control Panel</p>
                        </div>
                        <div className="flex flex-col py-2">
                             <button 
                                onClick={() => handleTabSwitch('analytics')} 
                                className={`px-6 py-4 flex items-center text-sm font-medium transition-colors border-l-4 ${activeTab === 'analytics' ? 'border-premium-900 bg-premium-50 text-premium-900' : 'border-transparent text-premium-600 hover:bg-premium-50'}`}
                             >
                                 <BarChart3 size={18} className="mr-3" /> Analytics Overview
                             </button>
                             <button 
                                onClick={() => handleTabSwitch('products')} 
                                className={`px-6 py-4 flex items-center text-sm font-medium transition-colors border-l-4 ${activeTab === 'products' ? 'border-premium-900 bg-premium-50 text-premium-900' : 'border-transparent text-premium-600 hover:bg-premium-50'}`}
                             >
                                 <PackageOpen size={18} className="mr-3" /> Product Catalog
                             </button>
                             <button 
                                onClick={() => handleTabSwitch('collections')} 
                                className={`px-6 py-4 flex items-center text-sm font-medium transition-colors border-l-4 ${activeTab === 'collections' ? 'border-premium-900 bg-premium-50 text-premium-900' : 'border-transparent text-premium-600 hover:bg-premium-50'}`}
                             >
                                 <Layers size={18} className="mr-3" /> Collections
                             </button>
                             <button 
                                onClick={() => handleTabSwitch('orders')} 
                                className={`px-6 py-4 flex items-center text-sm font-medium transition-colors border-l-4 ${activeTab === 'orders' ? 'border-premium-900 bg-premium-50 text-premium-900' : 'border-transparent text-premium-600 hover:bg-premium-50'}`}
                             >
                                 <LayoutList size={18} className="mr-3" /> Order Management
                             </button>
                             <button 
                                onClick={() => handleTabSwitch('settings')} 
                                className={`px-6 py-4 flex items-center text-sm font-medium transition-colors border-l-4 ${activeTab === 'settings' ? 'border-premium-900 bg-premium-50 text-premium-900' : 'border-transparent text-premium-600 hover:bg-premium-50'}`}
                             >
                                 <Home size={18} className="mr-3" /> Site Settings
                             </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {loading ? (
                         <div className="bg-white p-8 rounded-sm shadow-sm min-h-[500px] flex items-center justify-center border border-premium-100">
                             <div className="animate-spin h-10 w-10 text-premium-900 border-4 border-t-transparent rounded-full"></div>
                         </div>
                    ) : (
                        <div className="animate-fade-in delay-100">
                            
                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && analytics && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-sm border border-premium-100 shadow-sm flex flex-col justify-center items-center text-center">
                                             <p className="text-premium-500 text-sm font-medium uppercase tracking-wider mb-2">Total Revenue</p>
                                             <p className="text-3xl font-serif text-premium-900 font-bold tracking-tight">₹{analytics.totalRevenue.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-sm border border-premium-100 shadow-sm flex flex-col justify-center items-center text-center">
                                             <p className="text-premium-500 text-sm font-medium uppercase tracking-wider mb-2">Total Orders</p>
                                             <p className="text-3xl font-serif text-premium-900 font-bold tracking-tight">{analytics.totalOrders}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-sm border border-premium-100 shadow-sm flex flex-col justify-center items-center text-center">
                                             <p className="text-premium-500 text-sm font-medium uppercase tracking-wider mb-2">Pending Fulfillment</p>
                                             <p className="text-3xl font-serif text-amber-600 font-bold tracking-tight">{analytics.pendingOrders}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-sm border border-premium-100 shadow-sm">
                                         <h3 className="text-lg font-serif text-premium-900 mb-6 border-b border-premium-100 pb-4">Top Selling Units</h3>
                                         <div className="space-y-4">
                                            {Object.entries(analytics.salesByProduct).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([title, qty]) => (
                                                <div key={title} className="flex justify-between items-center bg-premium-50 p-3 rounded-sm">
                                                    <span className="text-premium-900 font-medium">{title}</span>
                                                    <span className="text-premium-600 text-sm">{qty} units</span>
                                                </div>
                                            ))}
                                         </div>
                                    </div>
                                </div>
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                (isAddingProduct || editingProduct) ? (
                                    <AddProductForm 
                                        user={user} 
                                        onSuccess={handleProductAdded} 
                                        onCancel={() => { setIsAddingProduct(false); setEditingProduct(null); }} 
                                        initialProduct={editingProduct}
                                    />
                                ) : (
                                    <div className="bg-white rounded-sm border border-premium-100 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-premium-100 flex justify-between items-center bg-premium-50">
                                            <h3 className="text-xl font-serif text-premium-900">Inventory Management</h3>
                                            <button onClick={() => setIsAddingProduct(true)} className="btn-primary flex items-center py-2 px-4 shadow-md text-sm">
                                                <PlusCircle size={16} className="mr-2" /> Add New
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-white border-b border-premium-100 text-sm uppercase text-premium-500 tracking-wider">
                                                        <th className="p-4 font-medium">Product</th>
                                                        <th className="p-4 font-medium">Price</th>
                                                        <th className="p-4 font-medium">Category</th>
                                                        <th className="p-4 font-medium">Stock Status</th>
                                                        <th className="p-4 font-medium text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-premium-100">
                                                    {products.map(product => {
                                                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
                                                        return (
                                                        <tr key={product._id} className="hover:bg-premium-50/50 transition-colors">
                                                            <td className="p-4 flex items-center">
                                                                <div className="w-10 h-10 bg-premium-100 rounded-sm mr-3 overflow-hidden flex-shrink-0">
                                                                    <img src={getMediaUrl(product.variants[0]?.imageUrl)} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <span className="font-medium text-premium-900 line-clamp-1">{product.title}</span>
                                                            </td>
                                                            <td className="p-4 text-premium-700 font-medium">₹{product.price.toLocaleString()}</td>
                                                            <td className="p-4 text-premium-600 text-sm">{product.categories?.join(', ') || 'Uncategorized'}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {totalStock > 0 ? `${totalStock} In Stock` : 'Out of Stock'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 flex justify-end gap-2 border-none">
                                                                <button onClick={() => setEditingProduct(product)} className="p-2 text-premium-500 hover:text-premium-900 hover:bg-premium-100 rounded transition-colors"><Pencil size={16} /></button>
                                                                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    )})}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Product Picker Modal */}
                            {showProductPicker && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowProductPicker(false)}>
                                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                        <div className="p-6 border-b border-premium-100 flex justify-between items-center bg-premium-50">
                                            <h3 className="text-xl font-serif text-premium-900">Add to <span className="font-bold">{activeCollection}</span></h3>
                                            <button onClick={() => setShowProductPicker(false)} className="text-premium-400 hover:text-premium-900 text-2xl leading-none transition-colors">&times;</button>
                                        </div>
                                        <div className="p-4 border-b border-premium-100">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={pickerSearch}
                                                onChange={e => setPickerSearch(e.target.value)}
                                                className="w-full border border-premium-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-premium-900 text-premium-900"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="overflow-y-auto flex-1 divide-y divide-premium-100">
                                            {allProducts
                                                .filter(p => !p.categories?.includes(activeCollection))
                                                .filter(p => p.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                                                .length === 0 ? (
                                                <div className="p-12 text-center text-premium-500">
                                                    <p className="font-serif text-premium-900 text-lg mb-1">No products found</p>
                                                    <p className="text-sm">All your products are already in this collection, or no products match your search.</p>
                                                </div>
                                            ) : (
                                                allProducts
                                                    .filter(p => !p.categories?.includes(activeCollection))
                                                    .filter(p => p.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                                                    .map(product => (
                                                        <div key={product._id} className="flex items-center px-6 py-4 hover:bg-premium-50 transition-colors">
                                                            <div className="w-12 h-12 bg-premium-100 rounded-sm mr-4 overflow-hidden flex-shrink-0">
                                                                <img src={getMediaUrl(product.variants[0]?.imageUrl)} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-premium-900 line-clamp-1">{product.title}</p>
                                                                <p className="text-xs text-premium-500 mt-0.5">₹{product.price?.toLocaleString()} &middot; {product.categories?.join(', ') || 'Uncategorized'}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddProductToCollection(product)}
                                                                className="ml-4 flex-shrink-0 btn-primary py-1.5 px-4 text-sm"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Collections Tab */}
                            {activeTab === 'collections' && (
                                isAddingProduct ? (
                                    <AddProductForm user={user} onSuccess={handleProductAdded} onCancel={() => setIsAddingProduct(false)} initialCategory={activeCollection} />
                                ) : activeCollection ? (
                                    <div className="bg-white rounded-sm border border-premium-100 shadow-sm overflow-hidden animate-fade-in">
                                        <div className="p-6 border-b border-premium-100 flex justify-between items-center bg-premium-50">
                                            <div className="flex items-center">
                                                <button onClick={() => setActiveCollection(null)} className="mr-4 text-sm font-medium text-premium-500 hover:text-premium-900 transition-colors uppercase tracking-wider flex items-center">
                                                    &larr; Back
                                                </button>
                                                <h3 className="text-xl font-serif text-premium-900 flex items-center">
                                                    Collection: <span className="font-bold ml-2">{activeCollection}</span>
                                                </h3>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/40 p-2 rounded-sm border border-premium-100/50">
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const currentMeta = collectionMeta.find(m => m.name === activeCollection);
                                                        const isNavVisible = currentMeta ? currentMeta.showInNavbar !== false : true;
                                                        const isCuratedVisible = currentMeta ? currentMeta.showInCurated !== false : true;
                                                        const mediaUrl = currentMeta?.imageUrl || '';
                                                        const mediaType = currentMeta?.mediaType || 'image';
                                                        return (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleToggleVisibility({ showInNavbar: !isNavVisible })} 
                                                                    className={`flex items-center py-2 px-3 text-xs tracking-tighter rounded transition-colors shadow-sm border ${isNavVisible ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200'}`}
                                                                    title="Toggle Visibility in Navbar"
                                                                >
                                                                    <Menu size={14} className="mr-1.5" /> {isNavVisible ? 'Menu' : 'Hidden'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleToggleVisibility({ showInCurated: !isCuratedVisible })} 
                                                                    className={`flex items-center py-2 px-3 text-xs tracking-tighter rounded transition-colors shadow-sm border ${isCuratedVisible ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200'}`}
                                                                    title="Toggle Visibility in Curated Selections"
                                                                >
                                                                    <Home size={14} className="mr-1.5" /> {isCuratedVisible ? 'Curated' : 'Omitted'}
                                                                </button>

                                                                <div className="h-6 w-[1px] bg-premium-100 mx-1 hidden sm:block"></div>

                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Img/Video URL"
                                                                        value={mediaUrl}
                                                                        onChange={(e) => handleToggleVisibility({ imageUrl: e.target.value })}
                                                                        className="text-[10px] w-28 border border-premium-100 rounded px-2 py-1.5 focus:outline-none focus:border-premium-400 bg-white"
                                                                    />
                                                                    <input 
                                                                        type="file" 
                                                                        ref={fileInputRef} 
                                                                        onChange={handleMediaUpload} 
                                                                        className="hidden" 
                                                                        accept="image/*,video/*"
                                                                    />
                                                                    <button 
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="p-1.5 text-premium-400 hover:text-premium-900 border border-premium-100 rounded bg-white shadow-sm transition-colors"
                                                                        title="Upload from device"
                                                                    >
                                                                        <Upload size={14} />
                                                                    </button>
                                                                    <select 
                                                                        value={mediaType}
                                                                        onChange={(e) => handleToggleVisibility({ mediaType: e.target.value })}
                                                                        className="text-[10px] border border-premium-100 rounded px-1 py-1.5 focus:outline-none focus:border-premium-400 bg-white"
                                                                    >
                                                                        <option value="image">IMG</option>
                                                                        <option value="video">VID</option>
                                                                    </select>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                                <button onClick={openProductPicker} className="btn-primary flex items-center py-2 px-4 shadow-sm text-sm">
                                                    <PlusCircle size={16} className="mr-2" /> Add Item
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-white border-b border-premium-100 text-sm uppercase text-premium-500 tracking-wider">
                                                        <th className="p-4 font-medium">Product</th>
                                                        <th className="p-4 font-medium">Price</th>
                                                        <th className="p-4 font-medium">Stock Status</th>
                                                        <th className="p-4 font-medium text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-premium-100">
                                                    {products.filter(p => p.categories?.includes(activeCollection)).length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="p-12 text-center text-premium-500">
                                                                <Layers size={48} className="mx-auto mb-4 text-premium-200" />
                                                                <p className="text-lg font-serif text-premium-900 mb-1">This collection is empty</p>
                                                                <p className="text-sm">Click "Add Item" to start populating your catalog.</p>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                    products.filter(p => p.categories?.includes(activeCollection)).map(product => {
                                                        const totalStock = product.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
                                                        return (
                                                        <tr key={product._id} className="hover:bg-premium-50/50 transition-colors">
                                                            <td className="p-4 flex items-center">
                                                                <div className="w-10 h-10 bg-premium-100 rounded-sm mr-3 overflow-hidden flex-shrink-0">
                                                                    <img src={getMediaUrl(product.variants[0]?.imageUrl)} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <span className="font-medium text-premium-900 line-clamp-1">{product.title}</span>
                                                            </td>
                                                            <td className="p-4 text-premium-700 font-medium">₹{product.price.toLocaleString()}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {totalStock > 0 ? `${totalStock} In Stock` : 'Out of Stock'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 flex justify-end gap-2 border-none">
                                                                <button onClick={() => handleRemoveProductFromCollection(product)} className="p-2 text-premium-400 hover:text-premium-900 hover:bg-premium-100 rounded transition-colors" title="Remove from this collection"><Layers size={16} /></button>
                                                                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    )
                                                    })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-sm border border-premium-100 shadow-sm overflow-hidden p-6 animate-fade-in">
                                        <div className="flex justify-between items-center mb-6 border-b border-premium-100 pb-4">
                                            <h3 className="text-xl font-serif text-premium-900">My Collections</h3>
                                            <button onClick={handleCreateCollection} className="btn-primary flex items-center py-2 px-4 shadow-md text-sm">
                                                <PlusCircle size={16} className="mr-2" /> New Collection
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(() => {
                                                const combinedCollections = products.reduce((acc, p) => {
                                                    const cats = p.categories && p.categories.length > 0 ? p.categories : ['Uncategorized'];
                                                    cats.forEach(cat => {
                                                        acc[cat] = (acc[cat] || 0) + 1;
                                                    });
                                                    return acc;
                                                }, {});
                                                
                                                draftCollections.forEach(dc => {
                                                    if (combinedCollections[dc] === undefined) {
                                                        combinedCollections[dc] = 0;
                                                    }
                                                });

                                                return Object.entries(combinedCollections).map(([cat, count]) => {
                                                    const meta = collectionMeta.find(m => m.name === cat);
                                                    return (
                                                    <div 
                                                        key={cat} 
                                                        onClick={() => setActiveCollection(cat)}
                                                        className="relative border border-premium-200 rounded p-6 cursor-pointer hover:border-premium-900 hover:shadow-md transition-all group flex flex-col justify-center items-center text-center bg-premium-50/50 hover:bg-white"
                                                    >
                                                        <div className="absolute top-3 right-3 flex gap-1.5">
                                                            {meta?.showInNavbar === false && (
                                                                <div className="text-red-400" title="Hidden from Navbar">
                                                                    <Menu size={12} />
                                                                </div>
                                                            )}
                                                            {meta?.showInCurated === false && (
                                                                <div className="text-amber-400" title="Hidden from Curated Selections">
                                                                    <Home size={12} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Layers size={32} className="mb-4 transition-colors text-premium-400 group-hover:text-premium-900" />
                                                        <h4 className="text-lg font-serif font-medium mb-1 text-premium-900">{cat}</h4>
                                                        <p className="text-sm text-premium-500">{count} Item{count !== 1 ? 's' : ''}</p>
                                                    </div>
                                                )});
                                            })()}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="bg-white rounded-sm border border-premium-100 shadow-sm overflow-hidden">
                                     <div className="p-6 border-b border-premium-100 bg-premium-50">
                                         <h3 className="text-xl font-serif text-premium-900">Recent Orders</h3>
                                     </div>
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-left border-collapse">
                                             <thead>
                                                 <tr className="bg-white border-b border-premium-100 text-sm uppercase text-premium-500 tracking-wider">
                                                     <th className="p-4 font-medium">Order ID</th>
                                                     <th className="p-4 font-medium">Customer</th>
                                                     <th className="p-4 font-medium">Amount</th>
                                                     <th className="p-4 font-medium">Status</th>
                                                     <th className="p-4 font-medium text-right">Actions</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-premium-100 text-sm">
                                                 {orders.map(order => (
                                                     <tr key={order._id} className="hover:bg-premium-50/50 transition-colors">
                                                         <td className="p-4 font-mono text-premium-600 text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                                                         <td className="p-4 text-premium-900 font-medium">{order.customerName}</td>
                                                         <td className="p-4 text-premium-900 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                                         <td className="p-4">
                                                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                 order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                 order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                 'bg-amber-100 text-amber-800'
                                                             }`}>
                                                                {order.status}
                                                             </span>
                                                         </td>
                                                         <td className="p-4 text-right border-none flex justify-end gap-3 items-center">
                                                             <select 
                                                                value={order.status} 
                                                                onChange={(e) => { e.stopPropagation(); handleUpdateOrderStatus(order._id, e.target.value); }}
                                                                className="border border-premium-200 text-sm rounded bg-white text-premium-900 focus:outline-none focus:border-premium-900 p-1"
                                                             >
                                                                 <option value="Pending">Pending</option>
                                                                 <option value="Shipped">Shipped</option>
                                                                 <option value="Delivered">Delivered</option>
                                                             </select>
                                                             <button 
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="text-premium-600 hover:text-premium-900 font-medium text-xs uppercase tracking-wider underline underline-offset-4"
                                                             >
                                                                Details
                                                             </button>
                                                             <button 
                                                                onClick={() => handleDeleteOrder(order._id)}
                                                                className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Order"
                                                             >
                                                                 <Trash2 size={16} />
                                                             </button>
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                </div>
                            )}

                             {/* Settings Tab */}
                             {activeTab === 'settings' && (
                                 <div className="space-y-6 animate-fade-in">
                                     <div className="bg-white p-8 rounded-sm border border-premium-100 shadow-sm">
                                         <h3 className="text-2xl font-serif text-premium-900 mb-6 border-b border-premium-100 pb-4">Home Page Customization</h3>
                                         
                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                             {/* Hero Banner settings */}
                                             <div className="space-y-6">
                                                 <h4 className="text-sm font-bold uppercase tracking-widest text-premium-400">Hero Banner Media</h4>
                                                 
                                                 <div className="space-y-4">
                                                     <div>
                                                         <label className="block text-xs font-medium text-premium-500 mb-2 font-serif uppercase tracking-wider">Media Type</label>
                                                         <div className="flex gap-4">
                                                             <button 
                                                                onClick={async () => {
                                                                    await axios.post(`${API_BASE_URL}/api/settings`, { heroMediaType: 'image' }, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                    fetchSettings();
                                                                }}
                                                                className={`flex-1 py-3 px-4 rounded-sm border text-sm transition-all ${settings?.heroMediaType === 'image' ? 'bg-premium-900 text-white border-premium-900 shadow-md' : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'}`}
                                                             >
                                                                 Image
                                                             </button>
                                                             <button 
                                                                onClick={async () => {
                                                                    await axios.post(`${API_BASE_URL}/api/settings`, { heroMediaType: 'video' }, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                    fetchSettings();
                                                                }}
                                                                className={`flex-1 py-3 px-4 rounded-sm border text-sm transition-all ${settings?.heroMediaType === 'video' ? 'bg-premium-900 text-white border-premium-900 shadow-md' : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'}`}
                                                             >
                                                                 Video
                                                             </button>
                                                         </div>
                                                     </div>

                                                     <div>
                                                         <label className="block text-xs font-medium text-premium-500 mb-2 font-serif uppercase tracking-wider">Update Banner From Device</label>
                                                         <div className="flex items-center gap-4">
                                                             <label className="flex-1 border-2 border-dashed border-premium-200 hover:border-premium-400 rounded-sm p-8 transition-all cursor-pointer group bg-premium-50/30">
                                                                 <input type="file" className="hidden" accept="image/*,video/*" onChange={handleHeroUpload} />
                                                                 <div className="flex flex-col items-center">
                                                                     <Upload size={32} className="text-premium-300 group-hover:text-premium-900 transition-colors mb-2" />
                                                                     <span className="text-sm text-premium-600">Click to upload image or video</span>
                                                                     <span className="text-[10px] text-premium-400 mt-1 uppercase tracking-tighter">Maximum file size: 10MB</span>
                                                                 </div>
                                                             </label>
                                                         </div>
                                                     </div>

                                                     <div>
                                                         <label className="block text-xs font-medium text-premium-500 mb-2 font-serif uppercase tracking-wider">Media URL Manual Entry</label>
                                                         <div className="flex gap-2">
                                                             <input 
                                                                 type="text" 
                                                                 placeholder="https://example.com/media.mp4"
                                                                 defaultValue={settings?.heroMediaUrl}
                                                                 onBlur={async (e) => {
                                                                     await axios.post(`${API_BASE_URL}/api/settings`, { heroMediaUrl: e.target.value }, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                     fetchSettings();
                                                                 }}
                                                                 className="flex-1 border border-premium-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-premium-900 text-premium-900"
                                                             />
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* Preview */}
                                             <div className="space-y-6">
                                                 <h4 className="text-sm font-bold uppercase tracking-widest text-premium-400">Live Preview</h4>
                                                 <div className="aspect-video w-full bg-premium-100 rounded-sm overflow-hidden border border-premium-200 relative shadow-inner">
                                                     {settings?.heroMediaUrl ? (
                                                         settings.heroMediaType === 'video' ? (
                                                             <video 
                                                                 src={getMediaUrl(settings.heroMediaUrl)} 
                                                                 autoPlay 
                                                                 muted 
                                                                 loop 
                                                                 className="w-full h-full object-cover" 
                                                             />
                                                         ) : (
                                                             <img 
                                                                 src={getMediaUrl(settings.heroMediaUrl)} 
                                                                 alt="Preview" 
                                                                 className="w-full h-full object-cover" 
                                                             />
                                                         )
                                                     ) : (
                                                         <div className="w-full h-full flex items-center justify-center text-premium-300 italic text-sm">
                                                             No media configured
                                                         </div>
                                                     )}
                                                     <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-premium-900">
                                                         HERO PREVIEW
                                                     </div>
                                                 </div>
                                                 <p className="text-xs text-premium-400 italic">This media will be displayed as the main background of your landing page.</p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {/* Order Details Modal */}
                             {selectedOrder && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelectedOrder(null)}>
                                     <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                                         <div className="p-6 border-b border-premium-100 flex justify-between items-center bg-premium-900 text-white">
                                             <div>
                                                 <h3 className="text-xl font-serif">Order Details</h3>
                                                 <p className="text-xs text-premium-300 font-mono mt-1 lowercase">ID: #{selectedOrder._id}</p>
                                             </div>
                                             <button onClick={() => setSelectedOrder(null)} className="text-white/70 hover:text-white text-2xl leading-none transition-colors">&times;</button>
                                         </div>
                                         
                                         <div className="overflow-y-auto p-6 space-y-8">
                                             {/* Customer & Payment Section */}
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                 <div className="space-y-4">
                                                     <h4 className="text-xs font-bold uppercase tracking-widest text-premium-400 border-b border-premium-100 pb-2">Customer Information</h4>
                                                     <div>
                                                         <p className="text-sm font-medium text-premium-900">{selectedOrder.customerName}</p>
                                                         <p className="text-sm text-premium-500">{selectedOrder.customerEmail}</p>
                                                     </div>
                                                 </div>
                                                 <div className="space-y-4">
                                                     <h4 className="text-xs font-bold uppercase tracking-widest text-premium-400 border-b border-premium-100 pb-2">Payment Details</h4>
                                                     <div>
                                                         <p className="text-sm font-medium text-premium-900 uppercase">Method: {selectedOrder.paymentDetails?.method || 'Razorpay'}</p>
                                                         <p className="text-sm text-premium-600 font-bold mt-1">Total: ₹{selectedOrder.totalAmount.toLocaleString()}</p>
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* Shipping Address Section */}
                                             <div className="space-y-4">
                                                 <h4 className="text-xs font-bold uppercase tracking-widest text-premium-400 border-b border-premium-100 pb-2">Shipping Address</h4>
                                                 <div className="bg-premium-50 p-4 rounded-sm text-sm text-premium-700 leading-relaxed">
                                                     {selectedOrder.shippingAddress ? (
                                                         <>
                                                            <p>{selectedOrder.shippingAddress.street}</p>
                                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                                                            <p>{selectedOrder.shippingAddress.country || 'India'}</p>
                                                         </>
                                                     ) : (
                                                         <p className="italic text-premium-400">No address provided</p>
                                                     )}
                                                 </div>
                                             </div>

                                             {/* Items Section */}
                                             <div className="space-y-4">
                                                 <h4 className="text-xs font-bold uppercase tracking-widest text-premium-400 border-b border-premium-100 pb-2">Items Ordered</h4>
                                                 <div className="space-y-3">
                                                     {selectedOrder.items.map((item, idx) => (
                                                         <div key={idx} className="flex items-center gap-4 bg-white border border-premium-100 p-3 rounded-sm shadow-sm">
                                                             {item.image && (
                                                                 <div className="w-12 h-12 bg-premium-100 rounded-sm overflow-hidden flex-shrink-0">
                                                                     <img src={getMediaUrl(item.image)} className="w-full h-full object-cover" alt="" />
                                                                 </div>
                                                             )}
                                                             <div className="flex-1 min-w-0">
                                                                 <p className="font-medium text-premium-900 text-sm line-clamp-1">{item.title}</p>
                                                                 <p className="text-xs text-premium-500 font-sans">{item.color} &middot; Size: {item.size} &middot; Qty: {item.quantity}</p>
                                                             </div>
                                                             <p className="text-sm font-bold text-premium-700">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>
                                         
                                         <div className="p-6 border-t border-premium-100 bg-premium-50 text-right">
                                             <button onClick={() => setSelectedOrder(null)} className="btn-primary py-2 px-8 shadow-md">Close</button>
                                         </div>
                                     </div>
                                </div>
                             )}

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SellerDashboard;
