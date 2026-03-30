import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Kurtis = ({ onQuickView }) => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter only Kurtis and convert to array
  const kurtiProducts = Object.values(products).filter(p => p.categories?.includes('Kurtis'));

  return (
    <div>
      <section className="page-header" style={{ backgroundImage: "url('/images/hero-white-pants.jpg')" }}>
        <div className="header-content">
          <h1>Kurtis Collection</h1>
          <p>Discover our range of elegant and comfortable kurtis.</p>
        </div>
      </section>

      <section className="products container">
        <div className="product-grid" id="kurtis-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : kurtiProducts.length > 0 ? (
            kurtiProducts.map((product) => (
              <ProductCard 
                key={product._id || product.title} 
                product={product} 
                onClick={onQuickView} 
              />
            ))
          ) : (
            <p>No kurtis found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Kurtis;
