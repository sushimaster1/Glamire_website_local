import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useStore from '../store/useStore';
import { getMediaUrl } from '../utils/api';

const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist } = useStore();
  const isWishlisted = wishlist.some(item => item._id === product._id);

  // Default to first variant's image or a placeholder
  const defaultImage = product.variants && product.variants.length > 0 
    ? product.variants[0].imageUrl 
    : 'https://via.placeholder.com/400x500?text=No+Image';

  const defaultHoverImage = product.variants && product.variants.length > 0 && product.variants[0].additionalImages?.length > 0
    ? product.variants[0].additionalImages[0]
    : defaultImage;

  return (
    <div className="group relative animate-fade-in flex flex-col h-full">
      <div className="relative overflow-hidden w-full bg-premium-100 aspect-[3/4] rounded-sm mb-4">
        {/* Wishlist Button */}
        <button 
          onClick={() => toggleWishlist(product)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/50 backdrop-blur-sm text-premium-900 hover:bg-white hover:text-red-500 transition-all duration-300 shadow-sm"
        >
          <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
        </button>

        <Link to={`/product/${product._id}`} className="block w-full h-full relative cursor-pointer">
          <img 
            src={getMediaUrl(defaultImage)} 
            alt={product.title} 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
          />
          <img 
            src={getMediaUrl(defaultHoverImage)} 
            alt={`${product.title} alternative`} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
          />
        </Link>
        
        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex justify-center z-10">
          <Link to={`/product/${product._id}`} className="w-full btn-primary py-3 text-center text-sm tracking-widest backdrop-blur-md bg-premium-900/90 shadow-lg">
            QUICK VIEW
          </Link>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-premium-900 font-serif text-lg leading-tight mb-1 truncate">
          <Link to={`/product/${product._id}`} className="hover:text-premium-600 transition-colors">
            {product.title}
          </Link>
        </h3>
        <p className="text-premium-500 text-sm mb-2">{product.categories?.join(', ') || 'Uncategorized'}</p>
        <p className="text-premium-900 font-medium mt-auto">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default ProductCard;
