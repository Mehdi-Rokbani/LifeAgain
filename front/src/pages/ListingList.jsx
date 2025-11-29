import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListingsList.css";

export default function ListingsList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log("🔄 Récupération des annonces...");
        const response = await fetch("http://localhost:4000/api/listings");
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📦 Données reçues:", data);
        
        // CORRECTION : Gérer les différents formats de réponse
        let listingsArray = [];
        
        if (data.success && Array.isArray(data.listings)) {
          // Format: { success: true, listings: [...] }
          listingsArray = data.listings;
        } else if (Array.isArray(data)) {
          // Format: [...] (tableau direct)
          listingsArray = data;
        } else if (data.listings && Array.isArray(data.listings)) {
          // Autre format possible
          listingsArray = data.listings;
        } else {
          console.warn("⚠️ Format de données inattendu:", data);
          listingsArray = [];
        }
        
        setListings(listingsArray);
        
      } catch (err) {
        console.error("❌ Erreur fetchListings:", err);
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // CORRECTION : S'assurer que listings est un tableau avant d'utiliser slice
  const safeListings = Array.isArray(listings) ? listings : [];
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = safeListings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeListings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-btn"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Hero Banner */}
      <div className="shop-hero">
        <div className="shop-hero-content">
          <h1>Boutique</h1>
          <p className="breadcrumb">Accueil &gt; Boutique</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="shop-controls">
        <div className="controls-left">
          <button className="filter-btn">
            <span className="icon">☰</span> Filtres
          </button>
          
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span className="icon">⊞</span>
          </button>
          
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span className="icon">☰</span>
          </button>

          <span className="results-count">
            Affichage {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, safeListings.length)} sur {safeListings.length} résultats
          </span>
        </div>

        <div className="controls-right">
          <label>Afficher</label>
          <select className="show-select">
            <option value="8">8</option>
            <option value="16">16</option>
            <option value="32">32</option>
          </select>

          <label>Trier par</label>
          <select className="sort-select">
            <option value="latest">Plus récent</option>
            <option value="price-low">Prix: Croissant</option>
            <option value="price-high">Prix: Décroissant</option>
            <option value="popular">Plus populaire</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {safeListings.length === 0 ? (
        <div className="no-listings">
          <div className="no-listings-content">
            <h3>Aucune annonce disponible</h3>
            <p>Soyez le premier à créer une annonce !</p>
            <Link to="/create-listing" className="create-listing-btn">
              Créer une annonce
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={`products-container ${viewMode}`}>
            {currentListings.map((listing) => {
              // CORRECTION : Gestion sécurisée des images
              const coverImage = listing.images?.find?.(img => img.isCover) || listing.images?.[0];
              
              return (
                <div key={listing._id} className="product-card">
                  <Link to={`/listings/${listing._id}`} className="product-link">
                    <div className="product-image">
                      {coverImage ? (
                        <img 
                          src={`http://localhost:4000${coverImage.url}`}
                          alt={listing.title}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="no-image">
                          <span>📷</span>
                          <p>Pas d'image</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-title">{listing.title}</h3>
                      <p className="product-category">{listing.category?.name || "Divers"}</p>
                      <p className="product-price">{listing.price} TND</p>
                    </div>
                  </Link>
                  
                  {/* Bouton de comparaison */}
                  <Link 
                    to={`/listings/${listing._id}`} 
                    className="compare-btn"
                  >
                    Détails
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && (
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  className="page-btn prev-btn"
                >
                  Précédent
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`page-btn ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  className="page-btn next-btn"
                >
                  Suivant
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}