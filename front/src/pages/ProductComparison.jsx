import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductComparison.css";

export default function ProductComparison() {
  const { id } = useParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/listings/${id}/compare`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la comparaison");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Comparison data:", data);
        setComparison(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Génération de la comparaison avec l'IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Erreur</h2>
        <p>{error}</p>
        <Link to={`/listings/${id}`} className="back-link">Retour au produit</Link>
      </div>
    );
  }

  const { listing, comparison: comp } = comparison;
  const newProduct = comp.newProduct;
  const usedProduct = comp.usedProduct;

  return (
    <div className="comparison-page">
      {/* Hero Banner */}
      <div className="comparison-hero">
        <div className="hero-content">
          <span className="ai-badge">🤖 Généré par IA</span>
          <h1>Product Comparison</h1>
          <p className="breadcrumb">Home &gt; Shop &gt; Comparison</p>
        </div>
      </div>

      {/* Product Cards */}
      <div className="comparison-cards">
        {/* Used Product Card */}
        <div className="product-comparison-card">
          <div className="card-header">
            <img 
              src={listing.images?.[0] ? `http://localhost:4000${listing.images[0].url}` : "https://via.placeholder.com/200"}
              alt={usedProduct.name}
            />
          </div>
          <div className="card-body">
            <h2>{usedProduct.name}</h2>
            <p className="price">{usedProduct.price} TND</p>
            <Link to={`/listings/${id}`} className="view-link">View More</Link>
          </div>
        </div>

        {/* New Product Card */}
        <div className="product-comparison-card new-product">
          <div className="card-header">
            <img 
              src="https://via.placeholder.com/200x200?text=Nouveau"
              alt={newProduct.name}
            />
          </div>
          <div className="card-body">
            <h2>{newProduct.name}</h2>
            <p className="price">{newProduct.price} TND</p>
            <button className="add-btn">Add A Product</button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-container">
        {/* General Section */}
        <section className="comparison-section">
          <h3>General</h3>
          <div className="comparison-table">
            <div className="table-row">
              <div className="label">Sales Package</div>
              <div className="value">{usedProduct.name}</div>
              <div className="value">{newProduct.name}</div>
            </div>
            <div className="table-row">
              <div className="label">Model Number</div>
              <div className="value">{usedProduct.specs[0] || "N/A"}</div>
              <div className="value">{newProduct.specs[0] || "N/A"}</div>
            </div>
            <div className="table-row">
              <div className="label">Secondary Material</div>
              <div className="value">{usedProduct.material}</div>
              <div className="value">{newProduct.material}</div>
            </div>
            <div className="table-row">
              <div className="label">Configuration</div>
              <div className="value">{usedProduct.condition}</div>
              <div className="value">New</div>
            </div>
            <div className="table-row">
              <div className="label">Upholstery Color</div>
              <div className="value">Used</div>
              <div className="value">Various colors</div>
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section className="comparison-section">
          <h3>Product</h3>
          <div className="comparison-table">
            <div className="table-row">
              <div className="label">Filling Material</div>
              <div className="value">{usedProduct.material}</div>
              <div className="value">{newProduct.material}</div>
            </div>
            <div className="table-row">
              <div className="label">Adjustable Headrest</div>
              <div className="value">No</div>
              <div className="value">Yes</div>
            </div>
            <div className="table-row">
              <div className="label">Maximum Load Capacity</div>
              <div className="value">Standard</div>
              <div className="value">Premium</div>
            </div>
            <div className="table-row">
              <div className="label">Origin of Manufacture</div>
              <div className="value">{usedProduct.originCountry}</div>
              <div className="value">{newProduct.originCountry}</div>
            </div>
          </div>
        </section>

        {/* Warranty Section */}
        <section className="comparison-section">
          <h3>Warranty</h3>
          <div className="comparison-table">
            <div className="table-row">
              <div className="label">Warranty Summary</div>
              <div className="value">{usedProduct.warranty}</div>
              <div className="value">{newProduct.warranty}</div>
            </div>
            <div className="table-row">
              <div className="label">Warranty Service Type</div>
              <div className="value">No warranty</div>
              <div className="value">Full manufacturer warranty</div>
            </div>
            <div className="table-row">
              <div className="label">Domestic Warranty</div>
              <div className="value">-</div>
              <div className="value">{newProduct.warranty}</div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="comparison-section analysis-section">
          <h3>🤖 AI Analysis</h3>
          <div className="analysis-card">
            <div className="analysis-item">
              <h4>💰 Price Advantage</h4>
              <p>{comp.comparison.priceAdvantage}</p>
            </div>
            <div className="analysis-item">
              <h4>🔍 Condition Analysis</h4>
              <p>{comp.comparison.conditionAnalysis}</p>
            </div>
            <div className="analysis-item">
              <h4>⭐ Value for Money</h4>
              <p>{comp.comparison.valueForMoney}</p>
            </div>
            <div className="analysis-item recommendation">
              <h4>✅ Recommendation</h4>
              <p>{comp.comparison.recommendation}</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to={`/listings/${id}`} className="btn-secondary">
            Back to Product
          </Link>
          <button className="btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}