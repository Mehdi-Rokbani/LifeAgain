import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoriteContext";
import Header from "../components/Header";
import "../assets/styles/Favorites.css";

export default function Favorites() {
    const { favorites, toggleFavorite } = useFavorites();

    if (!Array.isArray(favorites)) {
        return null;
    }

    return (
        <>
            <Header />

            <div className="favorites-page">
                <h1>❤️ Mes favoris</h1>

                {favorites.length === 0 ? (
                    <p className="empty">
                        Aucun produit dans vos favoris.
                    </p>
                ) : (
                    <div className="favorites-grid">
                        {favorites.map((fav) => {
                            if (!fav || !fav.listing) return null;

                            const listing = fav.listing;
                            const image =
                                Array.isArray(listing.images) &&
                                    listing.images.length > 0
                                    ? `http://localhost:5000${listing.images[0]}`
                                    : "https://via.placeholder.com/300x300?text=No+Image";

                            return (
                                <div key={fav._id} className="favorite-card">
                                    <Link to={`/listings/${listing._id}`}>
                                        <img src={image} alt={listing.title} />
                                    </Link>

                                    <div className="favorite-info">
                                        <h3>{listing.title}</h3>

                                        {listing.seller?.username && (
                                            <p className="seller">
                                                par <strong>{listing.seller.username}</strong>
                                            </p>
                                        )}

                                        <p className="price">
                                            {listing.price} TND
                                        </p>

                                        <button
                                            className="remove-btn"
                                            onClick={() => toggleFavorite(listing._id)}
                                        >
                                            💔 Retirer
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
