import React, { useState, useEffect, useContext, useMemo } from "react";
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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/listings");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        let rawListings = [];
        if (data.success && Array.isArray(data.listings)) rawListings = data.listings;
        else if (Array.isArray(data)) rawListings = data;
        else if (Array.isArray(data.listings)) rawListings = data.listings;

        const onlyAvailable = rawListings.filter((l) => l.status === "available");
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

  // Pagination
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentListings = useMemo(() => {
    return listings.slice(indexOfFirstItem, indexOfLastItem);
  }, [listings, indexOfFirstItem, indexOfLastItem]);

  const paginate = (page) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="page-shell">
        <Header />
        <div className="shop-wrap">
          <div className="loading-container">
            <div className="spinner" />
            <p>Chargement des annonces...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <Header />
        <div className="shop-wrap">
          <div className="error-container">
            <h2>Erreur</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />

      {/* HERO */}
      <div className="shop-hero">
        <div className="shop-hero-content">
          <h1>Boutique</h1>
          <p className="breadcrumb">Accueil &gt; Boutique</p>
        </div>
      </div>

      <div className="shop-wrap">
        {/* CONTROLS */}
        <div className="shop-controls">
          <div className="controls-left">
            <button className="filter-btn" type="button" disabled>
              ☰ Filtres
              <span className="pill-soon">Bientôt</span>
            </button>

            <div className="view-toggle" role="tablist" aria-label="View mode">
              <button
                type="button"
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                title="Grid"
              >
                ⊞
              </button>

              <button
                type="button"
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                title="List"
              >
                ☰
              </button>
            </div>

            <span className="results-count">
              Affichage {Math.min(indexOfFirstItem + 1, listings.length)}–{Math.min(indexOfLastItem, listings.length)} sur{" "}
              {listings.length}
            </span>
          </div>
        </div>

        {/* PRODUCTS */}
        {listings.length === 0 ? (
          <div className="no-listings">
            <h3>Aucune annonce disponible</h3>
            <p>Reviens plus tard ou explore d’autres catégories.</p>
          </div>
        ) : (
          <>
            <div className={`products-container ${viewMode}`}>
              {currentListings.map((listing) => {
                const coverImage = listing.images?.[0];
                const sellerName =
                  listing.seller?.username || listing.seller?.name || "Vendeur";

                return (
                  <Link
                    key={listing._id}
                    to={`/listings/${listing._id}`}
                    className="product-card"
                  >
                    {/* IMAGE */}
                    <div className="product-image">
                      {coverImage ? (
                        <img
                          src={`http://localhost:5000${coverImage}`}
                          alt={listing.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-image">📦</div>
                      )}

                      {/* FAVORITE */}
                      {user?.role === "client" && (
                        <button
                          type="button"
                          className="favorite-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(listing._id);
                          }}
                          aria-label="Toggle favorite"
                          title="Favoris"
                        >
                          {isFavorited(listing._id) ? (
                            <FaHeart className="heart active" />
                          ) : (
                            <FaRegHeart className="heart" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="product-info">
                      <div className="product-top">
                        <h3 className="product-title" title={listing.title}>
                          {listing.title}
                        </h3>
                        <p className="product-price">{listing.price} TND</p>
                      </div>

                      <div className="product-meta">
                        <span className="product-seller">
                          par <strong>{sellerName}</strong>
                        </span>
                        <span className="product-badge">Disponible</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn nav"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  type="button"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    type="button"
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn nav"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  type="button"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
