import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "./ListingsList.css";
import Header from "../components/Header";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "../context/FavoriteContext";
import { AuthContext } from "../context/AuthContext";
import Footer from "../components/Footer";

export default function ListingsList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  const { toggleFavorite, isFavorited } = useFavorites();
  const { user } = useContext(AuthContext);

  const itemsPerPage = 8;

  // --------------------------------------------------
  // FETCH LISTINGS (ONLY AVAILABLE)
  // --------------------------------------------------
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/listings");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        let rawListings = [];

        if (data.success && Array.isArray(data.listings)) {
          rawListings = data.listings;
        } else if (Array.isArray(data)) {
          rawListings = data;
        } else if (Array.isArray(data.listings)) {
          rawListings = data.listings;
        }

        // ✅ FILTER HERE (IMPORTANT)
        const onlyAvailable = rawListings.filter(
          (l) => l.status === "available"
        );

        setListings(onlyAvailable);
      } catch (err) {
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Header />

      {/* HERO */}
      <div className="shop-hero">
        <div className="shop-hero-content">
          <h1>Boutique</h1>
          <p className="breadcrumb">Accueil &gt; Boutique</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="shop-controls">
        <div className="controls-left">
          <button className="filter-btn">☰ Filtres</button>

          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            ⊞
          </button>

          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            ☰
          </button>

          <span className="results-count">
            Affichage {indexOfFirstItem + 1}–
            {Math.min(indexOfLastItem, listings.length)} sur{" "}
            {listings.length}
          </span>
        </div>
      </div>

      {/* PRODUCTS */}
      {listings.length === 0 ? (
        <div className="no-listings">
          <h3>Aucune annonce disponible</h3>
        </div>
      ) : (
        <>
          <div className={`products-container ${viewMode}`}>
            {currentListings.map((listing) => {
              const coverImage = listing.images?.[0];

              return (
                <div key={listing._id} className="product-card">
                  {/* FAVORITE */}
                  {user?.role === "client" && (
                    <button
                      className="favorite-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(listing._id);
                      }}
                    >
                      {isFavorited(listing._id) ? (
                        <FaHeart className="heart active" />
                      ) : (
                        <FaRegHeart className="heart" />
                      )}
                    </button>
                  )}

                  <Link
                    to={`/listings/${listing._id}`}
                    className="product-link"
                  >
                    <div className="product-image">
                      {coverImage ? (
                        <img
                          src={`http://localhost:5000${coverImage}`}
                          alt={listing.title}
                        />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{listing.title}</h3>

                      {listing.seller?.username && (
                        <p className="product-seller">
                          par <strong>{listing.seller.username}</strong>
                        </p>
                      )}

                      <p className="product-price">
                        {listing.price} TND
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <Footer />
    </div>
  );
}
