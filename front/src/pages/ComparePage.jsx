import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ComparePage.css";

export default function ComparePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState(null);
  const [realProduct, setRealProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 ID reçu dans ComparePage:", id);
    
    // Vérifier immédiatement si l'ID est valide
    if (!id || id === "undefined") {
      console.error("❌ ID manquant ou invalide:", id);
      setError("ID d'annonce manquant ou invalide");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Début de la récupération des données pour ID: ${id}`);

        // Récupérer l'annonce
        const listingResponse = await fetch(`http://localhost:5000/api/listings/${id}`);
        
        console.log("📡 Réponse listing:", listingResponse.status);
        
        if (!listingResponse.ok) {
          const errorText = await listingResponse.text();
          throw new Error(`Erreur ${listingResponse.status}: ${errorText}`);
        }
        
        const listingData = await listingResponse.json();
        console.log("📦 Données annonce:", listingData);
        
        if (!listingData.success) {
          throw new Error(listingData.error || 'Erreur inconnue du serveur');
        }
        
        setListing(listingData.listing);
        
        // Récupérer les données de comparaison
        console.log("🔍 Récupération des données de comparaison...");
        const compareResponse = await fetch(`http://localhost:5000/api/listings/${id}/compare`);
        
        console.log("📡 Réponse comparaison:", compareResponse.status);
        
        if (!compareResponse.ok) {
          const errorText = await compareResponse.text();
          throw new Error(`Erreur API ${compareResponse.status}: ${errorText}`);
        }
        
        const compareData = await compareResponse.json();
        console.log("🤖 Données comparaison:", compareData);
        
        if (!compareData.success) {
          throw new Error(compareData.error || 'Erreur lors de la comparaison');
        }
        
        setComparison(compareData.comparison);
        setRealProduct(compareData.realProduct);
        
        console.log("✅ Données chargées avec succès");
        
      } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        setError(error.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getRecommendationClass = (rec) => {
    if (!rec) return 'a-considerer';
    
    const recLower = rec.toLowerCase();
    if (recLower.includes('excellente') || recLower.includes('excellent')) return 'excellent-achat';
    if (recLower.includes('bon')) return 'bon-achat';
    if (recLower.includes('considérer') || recLower.includes('considerer')) return 'a-considerer';
    if (recLower.includes('éviter') || recLower.includes('eviter')) return 'eviter';
    return 'a-considerer';
  };

  const getRecommendationIcon = (rec) => {
    const recLower = rec.toLowerCase();
    if (recLower.includes('excellente') || recLower.includes('excellent')) return '🏆';
    if (recLower.includes('bon')) return '✅';
    if (recLower.includes('considérer') || recLower.includes('considerer')) return '⚠️';
    if (recLower.includes('éviter') || recLower.includes('eviter')) return '❌';
    return 'ℹ️';
  };

  if (loading) {
    return (
      <div className="compare-loading">
        <div className="loading-spinner"></div>
        <p>Analyse en cours avec l'IA DeepSeek...</p>
        <p className="loading-sub">
          Recherche des prix sur Mytek, Tunisianet et le marché tunisien
        </p>
        {id && <p className="loading-id">ID: {id}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-error">
        <div className="error-icon">🚫</div>
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        {!id && <p style={{color: '#e74c3c'}}>ID manquant dans l'URL</p>}
        <div className="error-actions">
          <Link to="/" className="btn secondary">
            ← Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="btn primary"
          >
            🔁 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!comparison || !listing) {
    return (
      <div className="compare-error">
        <div className="error-icon">📭</div>
        <h2>Données non disponibles</h2>
        <p>Impossible de charger les données de comparaison.</p>
        <div className="error-actions">
          <Link to="/" className="btn secondary">
            ← Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="btn primary"
          >
            🔁 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const recommendationClass = getRecommendationClass(comparison.recommendation);
  const recommendationIcon = getRecommendationIcon(comparison.recommendation);

  return (
    <div className="compare-container">
      {/* Header */}
      <div className="compare-header">
        <Link to={`/listings/${id}`} className="back-link">
          ← Retour à l'annonce
        </Link>
        <h1>🔍 Analyse Intelligente du Prix</h1>
        <p>
          Comparaison en temps réel • {realProduct?.store || 'Marché Tunisien'} • {comparison.dataSource}
          {comparison.isFallback && " • Données estimées"}
        </p>
      </div>

      {/* Grid Principal */}
      <div className="compare-grid">
        {/* Votre Produit Occasion */}
        <div className="product-card">
          <div className="card-header">
            <h2>📦 Votre Produit Occasion</h2>
            <span className="product-badge used">Occasion</span>
          </div>
          
          <div className="product-info">
            <h3 className="product-title">{listing.title}</h3>
            
            <div className="price-section">
              <span className="price-amount">{listing.price} TND</span>
              <span className="price-label">Prix demandé</span>
            </div>
            
            <div className="product-details">
              <div className="detail-item">
                <span className="label">Catégorie:</span>
                <span className="value">{listing.category?.name || "Non spécifiée"}</span>
              </div>
              <div className="detail-item">
                <span className="label">État:</span>
                <span className="value">{listing.condition || "Non spécifié"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Description:</span>
                <span className="value">
                  {listing.description?.length > 100 
                    ? `${listing.description.substring(0, 100)}...` 
                    : listing.description || "Aucune description"}
                </span>
              </div>
              {listing.phone && (
                <div className="detail-item">
                  <span className="label">Contact:</span>
                  <span className="value">{listing.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analyse IA */}
        <div className="product-card">
          <div className="card-header">
            <h2>🤖 Analyse par Intelligence Artificielle</h2>
            <span className={`product-badge ${comparison.isFallback ? 'fallback' : 'api'}`}>
              {comparison.isFallback ? 'Estimation' : realProduct?.store || 'IA'}
            </span>
          </div>
          
          <div className="product-info">
            <h3 className="product-title">{realProduct?.name || listing.title}</h3>
            
            <div className="price-section">
              <span className="price-amount">{comparison.newPriceEstimate || 'N/A'}</span>
              <span className="price-label">
                Prix neuf estimé {realProduct?.store && `sur ${realProduct.store}`}
              </span>
            </div>

            {/* Économies ou Avertissement */}
            {comparison.priceDifference > 0 ? (
              <div className="savings-section">
                <div className="savings-badge">
                  <span className="savings-amount">
                    Économie potentielle de {comparison.priceDifference} TND
                  </span>
                  <span className="savings-percent">
                    Soit {comparison.savingsPercentage}% de réduction par rapport au neuf
                  </span>
                </div>
              </div>
            ) : comparison.priceDifference < 0 ? (
              <div className="warning-section">
                <div className="warning-badge">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">
                    Prix supérieur de {Math.abs(comparison.priceDifference)} TND au marché neuf
                  </span>
                </div>
              </div>
            ) : (
              <div className="savings-section">
                <div className="savings-badge" style={{background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)'}}>
                  <span className="savings-amount">Prix équivalent au marché neuf</span>
                  <span className="savings-percent">Considérez l'achat neuf avec garantie</span>
                </div>
              </div>
            )}

            {/* Lien vers le magasin */}
            {realProduct?.url && (
              <a 
                href={realProduct.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="api-link-btn"
              >
                Vérifier sur {realProduct.store}
              </a>
            )}

            {/* Recommandation IA */}
            <div className={`recommendation ${recommendationClass}`}>
              <span className="rec-icon">{recommendationIcon}</span>
              <div className="rec-content">
                <span className="rec-text">{comparison.recommendation || "À considérer"}</span>
                <span className="market-status">{comparison.marketStatus || "Analyse en cours"}</span>
              </div>
            </div>

            {/* Conseil détaillé */}
            <div className="api-analysis">
              <h4>Conseil d'Expert</h4>
              <p>{comparison.advice || "Analyse des prix en cours de traitement..."}</p>
              {realProduct?.snippet && realProduct.snippet !== comparison.advice && (
                <div className="api-snippet">
                  <strong>Info marché:</strong> {realProduct.snippet}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Informations */}
      <div className="api-footer">
        <div className="api-info">
          <span className="api-badge">DeepSeek AI</span>
          <span className="api-source">
            Source: {realProduct?.source || "Analyse de marché Tunisien"}
          </span>
          <span className="api-time">
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="action-buttons">
        <Link to={`/listings/${id}`} className="btn secondary">
          ← Retour à l'annonce
        </Link>
        <button 
          onClick={() => window.location.reload()} 
          className="btn primary"
        >
          🔄 Actualiser l'analyse
        </button>
        {realProduct?.url && (
          <a 
            href={realProduct.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn primary"
            style={{background: 'linear-gradient(135deg, #27ae60, #2ecc71)'}}
          >
            🛒 Voir le produit neuf
          </a>
        )}
      </div>
    </div>
  );
}