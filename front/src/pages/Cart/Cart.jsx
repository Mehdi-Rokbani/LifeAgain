import React from 'react';
import { usePanier } from '../../context/PanierContext';
import './Cart.css';

const Cart = () => {
    const { panier, loading, removeProduct, updateQuantity, totalPrice, itemCount } = usePanier();

    if (loading && !panier) {
        return <div className="cart-loading">Chargement du panier...</div>;
    }

    if (!panier || itemCount === 0) {
        return (
            <div className="cart-empty">
                <h2>🛒 Votre panier est vide</h2>
                <p>Ajoutez des articles pour commencer vos achats</p>
                <a href="/shop" className="btn-shop">Continuer mes achats</a>
            </div>
        );
    }

    return (
        <div className="cart-page">
            {/* Hero Section */}
            <div className="cart-hero">
                <h1>Cart</h1>
                <p className="breadcrumb">
                    <span>Home</span> &gt; <span>Cart</span>
                </p>
            </div>

            <div className="cart-container">
                {/* Cart Table */}
                <div className="cart-main">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {panier.items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="cart-product">
                                            <div className="cart-product-image">
                                                {item.product?.images?.[0] ? (
                                                    <img src={item.product.images[0]} alt={item.product.title} />
                                                ) : (
                                                    <div className="no-image">📦</div>
                                                )}
                                            </div>
                                            <span className="cart-product-name">
                                                {item.product?.title || 'Produit'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="cart-price">{item.price} TND</td>
                                    <td>
                                        <div className="quantity-control">
                                            <button 
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                disabled={loading || item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                disabled={loading}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="cart-subtotal">
                                        {(item.price * item.quantity).toFixed(2)} TND
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-remove"
                                            onClick={() => removeProduct(item.product._id)}
                                            disabled={loading}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cart Totals */}
                <div className="cart-totals">
                    <h3>Cart Totals</h3>
                    <div className="totals-row">
                        <span>Subtotal</span>
                        <span>{totalPrice.toFixed(2)} TND</span>
                    </div>
                    <div className="totals-row total">
                        <span>Total</span>
                        <span className="total-price">{totalPrice.toFixed(2)} TND</span>
                    </div>
                    <button className="btn-checkout">Check Out</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;