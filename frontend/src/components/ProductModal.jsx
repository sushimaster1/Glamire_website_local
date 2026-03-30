import React, { useState, useEffect } from 'react';
import { getMediaUrl } from '../utils/api';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const getInitialColor = () => {
    return product.colors && product.colors.length > 0 ? product.colors[0] : null;
  };

  const getInitialSize = (color) => {
    return color && color.sizes && color.sizes.length > 0 ? color.sizes[0] : null;
  };

  const [selectedColor, setSelectedColor] = useState(getInitialColor());
  const [selectedSize, setSelectedSize] = useState(getInitialSize(getInitialColor()));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update selection if product changes
  useEffect(() => {
    const color = getInitialColor();
    setSelectedColor(color);
    setSelectedSize(getInitialSize(color));
    setCurrentImageIndex(0);
  }, [product]);

  if (!selectedColor) return null;

  const allImages = [selectedColor.image, ...(selectedColor.additionalImages || [])];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (!color.sizes.includes(selectedSize)) {
      setSelectedSize(color.sizes[0]);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <div className="modal-body">
          <div className="modal-image">
            {allImages.length > 1 && (
              <button className="slider-btn prev-btn" onClick={handlePrevImage}>&#10094;</button>
            )}
            <img src={getMediaUrl(allImages[currentImageIndex])} alt={product.title} />
            {allImages.length > 1 && (
              <button className="slider-btn next-btn" onClick={handleNextImage}>&#10095;</button>
            )}
          </div>
          <div className="modal-details">
            <h2>{product.title}</h2>
            <p className="price">₹{product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>

            <div className="product-options">
              <div className="option-group">
                <label>Color:</label>
                <div className="color-options">
                  {product.colors.map(color => (
                    <div 
                      key={color.name}
                      className={`color-swatch ${selectedColor.name === color.name ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      onClick={() => handleColorChange(color)}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label>Size:</label>
                <div className="size-options">
                  {selectedColor.sizes.map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              className="btn" 
              onClick={() => {
                onAddToCart({
                  id: product._id || product.title,
                  title: product.title,
                  price: product.price,
                  color: selectedColor.name,
                  size: selectedSize,
                  image: selectedColor.image
                });
                onClose();
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
