import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, MoveLeft, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';
import { getMediaUrl, API_BASE_URL } from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  const isWishlisted = product ? wishlist.some(item => item._id === product._id) : false;

  useEffect(() => {
    // We fetch all products and find the one with matching _id
    const fetchProductDetails = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`);
        const matchedProduct = Object.values(data).find(p => p._id === id);
        
        if (matchedProduct) {
          setProduct(matchedProduct);
          // Set defaults based on variants
          if (matchedProduct.colors && matchedProduct.colors.length > 0) {
            setSelectedColor(matchedProduct.colors[0]);
            setMainImage(matchedProduct.colors[0].image);
            if (matchedProduct.colors[0].sizes.length > 0) {
              setSelectedSize(matchedProduct.colors[0].sizes[0]);
            }
          } else if (matchedProduct.variants && matchedProduct.variants.length > 0) {
             setMainImage(matchedProduct.variants[0].imageUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
     if (selectedColor) {
        setMainImage(selectedColor.image);
        // Auto-select first available size for this color if current size isn't available
        if (!selectedColor.sizes.includes(selectedSize) && selectedColor.sizes.length > 0) {
           setSelectedSize(selectedColor.sizes[0]);
        }
     }
  }, [selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
       setErrorMsg("Please select a color and size.");
       return;
    }
    setErrorMsg('');
    addToCart(product, { color: selectedColor.name, size: selectedSize }, quantity);
    
    // Optional: add a success toast or direct to cart
    navigate('/cart');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin h-8 w-8 text-premium-900 border-4 border-t-transparent rounded-full"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center pt-20">Product not found</div>;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center text-premium-500 hover:text-premium-900 mb-8 transition-colors">
          <MoveLeft size={16} className="mr-2" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4 h-full animate-fade-in">
             <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto w-full md:w-24 custom-scrollbar">
                {selectedColor && [selectedColor.image, ...(selectedColor.additionalImages || [])].map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-24 md:w-24 md:h-32 flex-shrink-0 border-2 ${mainImage === img ? 'border-premium-900' : 'border-transparent'} transition-all`}
                  >
                    <img src={getMediaUrl(img)} alt={`${product.title} view ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
             
             <div className="flex-1 bg-premium-100 aspect-[3/4] md:aspect-auto md:h-[700px] relative rounded-sm overflow-hidden">
                <img src={getMediaUrl(mainImage)} alt={product.title} className="w-full h-full object-cover" />
             </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col animate-slide-up">
            <div className="mb-2 flex justify-between items-start">
               <p className="text-premium-500 tracking-wider text-sm uppercase">{product.categories?.join(', ') || 'Uncategorized'}</p>
               <button onClick={() => toggleWishlist(product)} className="text-premium-400 hover:text-red-500 transition-colors">
                 <Heart size={24} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
               </button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-premium-900 mb-4">{product.title}</h1>
            <p className="text-2xl text-premium-800 font-medium mb-8">₹{product.price.toLocaleString('en-IN')}</p>
            
            <div className="mb-8 border-b border-premium-100 pb-8">
              <p className="text-premium-600 leading-relaxed font-sans">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-premium-900 uppercase tracking-wider mb-4">
                  Color: <span className="text-premium-600 ml-2 capitalize">{selectedColor?.name}</span>
                </h3>
                <div className="flex gap-4">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${
                        selectedColor?.name === color.name ? 'border-premium-900' : 'border-transparent'
                      }`}
                    >
                      <div 
                        className="w-full h-full rounded-full border shadow-sm" 
                        style={{ backgroundColor: color.hex || '#000' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedColor && selectedColor.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-medium text-premium-900 uppercase tracking-wider">Size</h3>
                  <button className="text-xs text-premium-500 hover:text-premium-900 underline underline-offset-4">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedColor.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 border flex items-center justify-center transition-colors ${
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
            )}

            {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

            {/* Add to Cart Actions */}
            <div className="flex gap-4 mt-auto border-t border-premium-100 pt-8">
              <div className="flex border border-premium-300 w-32 rounded-sm items-center text-premium-900">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-premium-100 transition-colors">-</button>
                 <span className="flex-1 text-center font-medium">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-premium-100 transition-colors">+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex justify-center items-center py-4 text-base tracking-widest shadow-xl hover:shadow-2xl translate-y-0 hover:-translate-y-1 transition-all duration-300"
              >
                <ShoppingBag size={20} className="mr-3" /> ADD TO BAG
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 bg-premium-50 p-6 border border-premium-200 rounded-sm">
               <ul className="text-sm text-premium-600 space-y-3 font-medium">
                  <li className="flex items-center"><span className="text-premium-900 mr-2">✓</span> Free complimentary shipping on all orders.</li>
                  <li className="flex items-center"><span className="text-premium-900 mr-2">✓</span> Delivery exactly when you need it.</li>
                  <li className="flex items-center"><span className="text-premium-900 mr-2">✓</span> 10-day seamless return/exchange policy.</li>
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
