import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-premium-900 text-premium-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6 bg-white rounded-xl p-3 shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
              <img src="/logo.png" alt="Glamire Fashion" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-premium-300 leading-relaxed mb-6">
              Elevating women's fashion with exquisite kurtis, elegant dresses, and premium apparel designed for the modern woman.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans font-semibold mb-6 uppercase tracking-wider text-sm text-white">Shop</h4>
            <ul className="space-y-4 text-sm text-premium-300">
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kurtis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dresses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bottoms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-6 uppercase tracking-wider text-sm text-white">Help</h4>
            <ul className="space-y-4 text-sm text-premium-300">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold mb-6 uppercase tracking-wider text-sm text-white">Newsletter</h4>
            <p className="text-sm text-premium-300 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border border-premium-600 px-4 py-2 w-full text-sm focus:outline-none focus:border-white transition-colors rounded-l-md"
              />
              <button 
                type="submit" 
                className="bg-premium-600 hover:bg-premium-500 text-white px-4 py-2 rounded-r-md transition-colors text-sm font-medium"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-premium-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-premium-400">
          <p>© {new Date().getFullYear()} Glamire Fashion. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
