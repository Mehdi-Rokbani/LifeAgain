import React from "react";
import { useNavigate } from "react-router-dom";
import { usePanier } from "../../context/PanierContext";
import "./Cart.css";
import Header from "../../components/Header";

const Cart = () => {
    const navigate = useNavigate();
    const { panier, loading, removeProduct, totalPrice, itemCount } = usePanier();

    const goToListing = (id) => {
        navigate(`/listings/${id}`);
    };

    if (loading && !panier) {
        return <div className="cart-loading">Chargement du panier...</div>;
    }

    if (!panier || itemCount === 0) {
        return (
            <div className="cart-empty">
                <h2>🛒 Votre panier est vide</h2>
                <p>Ajoutez des articles pour commencer vos achats</p>
                <button onClick={() => navigate("/shop")} className="btn-shop">
                    Continuer mes achats
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Header />

            {/* HERO */}
            <div className="cart-hero">
                <h1>Cart</h1>
                <p className="breadcrumb">
                    <span>Home</span> &gt; <span>Cart</span>
                </p>
            </div>

            <div className="cart-container">
                {/* CART TABLE */}
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
                            {panier.items.map((item) => {
                                const product = item.product;
                                if (!product) return null;

                                const price = product.price || 0;
                                const sellerName =
                                    product.seller?.username ||
                                    product.seller?.name ||
                                    "vendeur";

                                return (
                                    <tr key={product._id}>
                                        {/* PRODUCT */}
                                        <td>
                                            <div className="cart-product">
                                                {/* IMAGE */}
                                                <div
                                                    className="cart-product-image clickable"
                                                    onClick={() => goToListing(product._id)}
                                                >
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={`http://localhost:5000${product.images[0]}`}
                                                            alt={product.title}
                                                        />
                                                    ) : (
                                                        <div className="no-image">📦</div>
                                                    )}
                                                </div>

                                                {/* INFO */}
                                                <div className="cart-product-info">
                                                    <span
                                                        className="cart-product-name clickable"
                                                        onClick={() => goToListing(product._id)}
                                                    >
                                                        {product.title}
                                                        <span className="seller-name">
                                                            {" "}– {sellerName}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PRICE */}
                                        <td className="cart-price">
                                            {price.toFixed(2)} TND
                                        </td>

                                        {/* QUANTITY (FIXED) */}
                                        <td>
                                            <span className="fixed-quantity">1</span>
                                        </td>

                                        {/* SUBTOTAL */}
                                        <td className="cart-subtotal">
                                            {price.toFixed(2)} TND
                                        </td>

                                        {/* REMOVE */}
                                        <td>
                                            <button
                                                className="btn-remove"
                                                onClick={() => removeProduct(product._id)}
                                                disabled={loading}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* TOTALS */}
                <div className="cart-totals">
                    <h3>Cart Totals</h3>

                    <div className="totals-row">
                        <span>Subtotal</span>
                        <span>{totalPrice.toFixed(2)} TND</span>
                    </div>

                    <div className="totals-row total">
                        <span>Total</span>
                        <span className="total-price">
                            {totalPrice.toFixed(2)} TND
                        </span>
                    </div>

                    <button
                        className="btn-checkout"
                        onClick={() => navigate("/checkout")}
                    >
                        Check Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
