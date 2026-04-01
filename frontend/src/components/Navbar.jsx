import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { cart, wishlist, user, logout, categories, fetchCategories } = useStore();
    const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu & Search */}
          <div className="flex items-center space-x-4 md:w-1/3">
            <button className="p-2 -ml-2 text-premium-900 md:hidden">
              <Menu size={24} />
            </button>
            <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full max-w-[200px] md:max-w-xs' : 'w-10'}`}>
              <button 
                onClick={() => isSearchOpen && searchQuery ? handleSearch() : setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-premium-900 hover:text-premium-600 transition-colors z-10"
              >
                <Search size={20} />
              </button>
              {isSearchOpen && (
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                  className="absolute left-0 w-full pl-10 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Search premium apparel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-premium-50/50 border-b border-premium-900 focus:outline-none py-1 text-sm text-premium-900 font-sans tracking-wide"
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-premium-400 hover:text-premium-900"
                  >
                    &times;
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex justify-center md:w-1/3">
            <Link to="/" className="flex items-center">
              <span className="text-2xl md:text-3xl font-serif font-medium text-premium-900 tracking-widest">
                Glamire Fashion
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-6 md:w-1/3">
            <Link to="/wishlist" className="p-2 text-premium-900 hover:text-premium-600 transition-colors relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-premium-900 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            {user?.role === 'seller' && (
              <Link to="/seller" className="hidden sm:flex items-center text-xs font-medium uppercase tracking-widest text-premium-900 hover:text-premium-600 transition-colors mx-2">
                Dashboard
              </Link>
            )}
            <Link to="/profile" className="p-2 text-premium-900 hover:text-premium-600 transition-colors hidden sm:block">
              <User size={20} />
            </Link>
            
            <Link to="/cart" className="p-2 text-premium-900 hover:text-premium-600 transition-colors relative">
              <ShoppingBag size={20} />
              {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-premium-900 rounded-full">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Categories Menu */}
        <div className="hidden md:flex justify-center space-x-8 pb-4 text-xs font-sans font-medium tracking-[0.15em] text-premium-700 uppercase">
          {categories && categories.length > 0 ? categories.map((cat, idx) => (
            <Link key={idx} to={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-premium-900 transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-premium-900 hover:after:w-full after:transition-all after:duration-300">
              {cat}
            </Link>
          )) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
