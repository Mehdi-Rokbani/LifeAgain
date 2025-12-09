import React from 'react';
import { usePanier } from '../../context/PanierContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addProduct, loading } = usePanier();

    const handleAddToCart = async () => {
        console.log("🔵 Clic sur Add to Cart");
        console.log("📦 Produit ID:", product._id);
        
        const success = await addProduct(product._id);
        
        console.log("✅ Résultat:", success);
        
        if (success) {
            alert('Produit ajouté au panier !');
        } else {
            alert('Erreur lors de l\'ajout au panier');
        }
    };

    return (
        <div className="product-card">
            <div className="product-image">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                ) : (
                    <div className="no-image">📦</div>
                )}
                {product.condition === 'new' && (
                    <span className="badge-new">New</span>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">
                    {product.description.substring(0, 60)}...
                </p>
                <div className="product-footer">
                    <span className="product-price">{product.price} TND</span>
                    <button 
                        className="btn-add-cart"
                        onClick={handleAddToCart}
                        disabled={loading}
                    >
                        {loading ? 'Ajout...' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;