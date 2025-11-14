import React from 'react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <div className="product-card">
      {product.image && (
        <img src={product.image} alt={product.name} className="product-image" />
      )}
      <h3 className="product-title">{product.name || product.title}</h3>
      {product.price != null && <p className="product-price">Prix: {product.price} €</p>}
      <p className="product-desc">{product.description || ''}</p>
    </div>
  );
};

export default ProductCard;
