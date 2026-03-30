import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedSize, setSelectedSize] = useState('');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = searchQuery 
          ? `http://localhost:3000/api/products?search=${encodeURIComponent(searchQuery)}`
          : 'http://localhost:3000/api/products';
        const { data } = await axios.get(url);
        const productList = Object.values(data);
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  useEffect(() => {
    let result = products;

    if (category !== 'All') {
      result = result.filter(p => p.categories?.includes(category));
    }
    
    result = result.filter(p => p.price <= priceRange);

    if (selectedSize) {
       result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
    }

    setFilteredProducts(result);
  }, [category, priceRange, selectedSize, products]);

  const categories = ['All', 'Kurtis', 'Dresses', 'Pants', 'Tops'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-premium-50">
      {/* Page Header */}
      <div className="bg-premium-900 text-white py-16 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif tracking-widest mb-4">THE COLLECTION</h1>
        <p className="text-premium-300 font-sans max-w-xl mx-auto px-4">
          Explore our exclusive range of meticulously crafted premium apparel.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4">
          <div className="sticky top-28 bg-white p-6 rounded-sm border border-premium-100 shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2 text-premium-900 mb-6 border-b border-premium-100 pb-4">
              <SlidersHorizontal size={20} />
              <h2 className="font-serif text-xl">Filters</h2>
            </div>
            
            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-medium text-premium-900 mb-4 uppercase text-sm tracking-wider">Category</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat}
                      checked={category === cat}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-radio text-premium-900 focus:ring-premium-900 focus:ring-1 cursor-pointer"
                    />
                    <span className="text-premium-700 group-hover:text-premium-900 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <h3 className="font-medium text-premium-900 mb-4 uppercase text-sm tracking-wider">Max Price: ₹{priceRange}</h3>
              <input 
                type="range" 
                min="500" 
                max="15000" 
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full accent-premium-900"
              />
              <div className="flex justify-between text-xs text-premium-500 mt-2">
                <span>₹500</span>
                <span>₹15,000</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-premium-900 mb-4 uppercase text-sm tracking-wider">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                    className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                      selectedSize === size 
                        ? 'bg-premium-900 text-white border-premium-900' 
                        : 'border-premium-200 text-premium-700 hover:border-premium-900 hover:text-premium-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => { setCategory('All'); setPriceRange(10000); setSelectedSize(''); }}
              className="w-full text-center text-sm text-premium-500 hover:text-premium-900 mt-4 border-t border-premium-100 pt-4 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          <div className="mb-6 flex justify-between items-center text-premium-600 text-sm">
            <div className="flex flex-col">
              <span>Showing {filteredProducts.length} Results</span>
              {searchQuery && (
                <span className="text-xs text-premium-400 mt-1">
                  Searching for: "<span className="text-premium-900 font-medium italic">{searchQuery}</span>"
                  <button 
                    onClick={() => window.location.href = '/shop'} 
                    className="ml-2 text-red-400 hover:text-red-600 underline"
                  >
                    Clear Search
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 cursor-pointer border px-3 py-1.5 rounded-sm border-premium-200">
              <span>Sort by: Recommended</span>
              <ChevronDown size={16} />
            </div>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="animate-pulse flex flex-col">
                   <div className="bg-premium-200 aspect-[3/4] w-full mb-4 rounded-sm"></div>
                   <div className="h-4 bg-premium-200 w-3/4 mb-2"></div>
                   <div className="h-4 bg-premium-200 w-1/4"></div>
                 </div>
               ))}
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-premium-100 rounded-sm">
               <h3 className="text-2xl font-serif text-premium-900 mb-2">No Products Found</h3>
               <p className="text-premium-500">Try adjusting your filters to find what you're looking for.</p>
               <button 
                 onClick={() => { setCategory('All'); setPriceRange(10000); setSelectedSize(''); }}
                 className="mt-6 btn-outline"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
