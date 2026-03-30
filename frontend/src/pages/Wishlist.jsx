import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import useStore from '../store/useStore';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useStore();

  return (
    <div className="min-h-screen pt-28 pb-20 bg-premium-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-10">
           <div>
              <h1 className="text-4xl font-serif text-premium-900 mb-2">My Wishlist</h1>
              <p className="text-premium-500">{wishlist.length} items saved</p>
           </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white border border-premium-100 rounded-sm shadow-sm animate-fade-in">
            <HeartOff size={48} className="mx-auto text-premium-300 mb-6" />
            <h2 className="text-2xl font-serif text-premium-900 mb-2">Your wishlist is empty</h2>
            <p className="text-premium-500 mb-8">Save items you love here to easily find them later.</p>
            <Link to="/shop" className="btn-primary">DISCOVER PRODUCTS</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {wishlist.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
