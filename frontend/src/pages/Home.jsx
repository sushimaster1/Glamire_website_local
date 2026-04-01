import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { getMediaUrl, API_BASE_URL } from '../utils/api';
import useStore from '../store/useStore';

const Home = () => {
    const { settings } = useStore();
    const [products, setProducts] = useState([]);
    const [curatedCollections, setCuratedCollections] = useState([]);

    const heroMedia = settings?.heroMediaUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";
    const heroType = settings?.heroMediaType || "image";

    useEffect(() => {
        const fetchHomeData = async () => {
             try {
                 const { data: prods } = await axios.get(`${API_BASE_URL}/api/products`);
                 const productList = Object.values(prods).slice(0, 4);
                 setProducts(productList);

                 const { data: curated } = await axios.get(`${API_BASE_URL}/api/products/categories?curatedOnly=true`);
                 setCuratedCollections(curated);
             } catch (err) {
                 console.error("Failed to load home data", err);
             }
        };
        fetchHomeData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center bg-premium-100 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {heroType === 'video' ? (
                        <video 
                            src={getMediaUrl(heroMedia)} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            className="w-full h-full object-cover object-center opacity-70"
                        />
                    ) : (
                        <img 
                            src={getMediaUrl(heroMedia)} 
                            alt="Hero Banner" 
                            className="w-full h-full object-cover object-center opacity-70"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-premium-50/80 to-transparent"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-3xl animate-slide-up">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-premium-900 mb-6 drop-shadow-sm tracking-tight">
                        Timeless Elegance
                    </h1>
                    <p className="text-lg md:text-xl text-premium-800 mb-10 font-sans max-w-2xl mx-auto">
                        Discover our new collection of premium ethnic and western wear crafted for the modern woman.
                    </p>
                    <Link to="/shop" className="inline-block btn-primary text-lg px-10 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300">
                        EXPLORE COLLECTION
                    </Link>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-16 border-b border-premium-100 pb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-premium-900 mb-2">New Arrivals</h2>
                            <p className="text-premium-500">Discover the latest additions to our collection</p>
                        </div>
                        <Link to="/shop" className="hidden md:inline-flex items-center text-premium-600 font-medium hover:text-premium-900 transition-colors group">
                            View All <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.length > 0 ? products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        )) : (
                            <div className="col-span-4 text-center py-12 text-premium-400">Loading products from runway...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Curated Selections (Categories) Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-premium-900 mb-4">Curated Selections</h2>
                    <div className="h-1 w-20 bg-premium-400 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {curatedCollections.length > 0 ? curatedCollections.slice(0, 3).map((item, idx) => {
                        const cat = typeof item === 'string' ? item : item.name;
                        const customMedia = typeof item === 'object' ? item.imageUrl : '';
                        const mediaType = typeof item === 'object' ? item.mediaType : 'image';

                        const imageMap = {
                            'Kurtis': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1974&auto=format&fit=crop',
                            'Dresses': 'https://images.unsplash.com/photo-1515347619152-16a7f613c242?q=80&w=1974&auto=format&fit=crop',
                            'Pants': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1974&auto=format&fit=crop'
                        };
                        const displayImg = imageMap[cat] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop';
                        
                        return (
                            <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className={`group relative overflow-hidden h-120 border animate-fade-in shadow-sm hover:shadow-lg transition-all delay-${idx * 100}`}>
                                {mediaType === 'video' && customMedia ? (
                                    <video 
                                        src={getMediaUrl(customMedia)} 
                                        autoPlay 
                                        muted 
                                        loop 
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                ) : (
                                    <img 
                                        src={getMediaUrl(customMedia) || displayImg} 
                                        alt={cat} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute bottom-10 left-8 right-8 text-center glass-panel p-6">
                                    <h3 className="text-2xl font-serif text-premium-900 tracking-wider">Premium {cat}</h3>
                                    <p className="text-[10px] uppercase tracking-[0.3em] mt-2 text-premium-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Discover Collection</p>
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="col-span-3 text-center py-24 text-premium-400 font-serif border border-dashed border-premium-200 bg-premium-50/30">
                            Awaiting your curated selection...
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
