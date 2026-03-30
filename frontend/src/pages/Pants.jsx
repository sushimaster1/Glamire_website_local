import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Pants = ({ onQuickView }) => {
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

  // Filter only Pants and convert to array
  const pantsProducts = Object.values(products).filter(p => p.categories?.includes('Pants'));

  return (
    <div>
      <section className="page-header" style={{ backgroundImage: "url('/images/hero-black-pants.jpg')" }}>
        <div className="header-content">
          <h1>Pants Collection</h1>
          <p>Comfortable and stylish bottoms for every occasion.</p>
        </div>
      </section>

      <section className="products container">
        <div className="product-grid" id="pants-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : pantsProducts.length > 0 ? (
            pantsProducts.map((product) => (
              <ProductCard 
                key={product._id || product.title} 
                product={product} 
                onClick={onQuickView} 
              />
            ))
          ) : (
            <p>No pants found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Pants;
