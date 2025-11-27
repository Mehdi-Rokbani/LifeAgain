import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListingsList.css";

export default function ListingsList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const itemsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:4000/api/listings")
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des annonces...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Hero Banner */}
      <div className="shop-hero">
        <div className="shop-hero-content">
          <h1>Shop</h1>
          <p className="breadcrumb">Home &gt; Shop</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="shop-controls">
        <div className="controls-left">
          <button className="filter-btn">
            <span className="icon">☰</span> Filter
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
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, listings.length)} of {listings.length} results
          </span>
        </div>

        <div className="controls-right">
          <label>Show</label>
          <select className="show-select">
            <option value="8">8</option>
            <option value="16">16</option>
            <option value="32">32</option>
          </select>

          <label>Sort by</label>
          <select className="sort-select">
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`products-container ${viewMode}`}>
        {currentListings.map((listing) => {
          const coverImage = listing.images?.find(img => img.isCover) || listing.images?.[0];
          
          return (
            <Link 
              to={`/listings/${listing._id}`} 
              key={listing._id} 
              className="product-card"
            >
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
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pagination">
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
            Next
          </button>
        )}
      </div>
    </div>
  );
}