import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ListingDetails.css";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    console.log("🔍 ID reçu dans ListingDetail:", id);
    
    if (!id || id === "undefined") {
      console.error("❌ ID manquant ou invalide:", id);
      setError("ID d'annonce manquant ou invalide");
      setLoading(false);
      navigate("/");
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Récupération de l'annonce ID: ${id}`);
        const response = await fetch(`http://localhost:4000/api/listings/${id}`);
        
        console.log("📡 Réponse serveur:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("📦 Données reçues:", data);
        
        if (!data.success) {
          throw new Error(data.error || 'Erreur inconnue du serveur');
        }
        
        setListing(data.listing);
        
      } catch (err) {
        console.error("❌ Erreur fetchListing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  // Fonctions utilitaires pour formater les données
  const formatCategory = (category) => {
    if (!category) return "Non spécifiée";
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.name || category.title || "Catégorie";
    }
    return "Non spécifiée";
  };

  const formatLocation = (location) => {
    if (!location) return "Non spécifiée";
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      // Gérer les objets de localisation complexes
      if (location.coordinates && Array.isArray(location.coordinates)) {
        return `Location: ${location.coordinates.join(', ')}`;
      }
      return location.address || location.name || "Localisation";
    }
    return "Non spécifiée";
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Prix non spécifié";
    if (typeof price === 'number') return `${price} TND`;
    if (typeof price === 'string') return `${price} TND`;
    return "Prix non spécifié";
  };

  const formatCondition = (condition) => {
    if (!condition) return "Non spécifié";
    if (typeof condition === 'string') return condition;
    return "Non spécifié";
  };

  // Fonction pour partager sur les réseaux sociaux
  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const title = listing?.title || "Découvrez cette annonce";
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Fonction pour contacter le vendeur
  const handleContactSeller = () => {
    const phone = listing?.phone;
    if (phone && typeof phone === 'string') {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert("Numéro de téléphone non disponible");
    }
  };

  // Fonction pour ajouter au panier (simulée)
  const handleAddToCart = () => {
    if (!listing) return;
    
    const item = {
      id: listing._id,
      title: listing.title,
      price: listing.price,
      quantity: quantity,
      size: selectedSize,
      image: listing.images?.[0]?.url
    };
    
    // Simulation d'ajout au panier
    console.log("🛒 Article ajouté au panier:", item);
    alert(`${quantity} x ${listing.title} ajouté au panier`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de l'annonce...</p>
        {id && <p className="loading-id">ID: {id}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <div className="error-actions">
          <Link to="/" className="btn secondary">
            Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="btn primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="error-container">
        <div className="error-icon">📭</div>
        <h2>Annonce non trouvée</h2>
        <p>L'annonce que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link to="/" className="btn primary">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Gestion des images
  const allImages = listing.images || [];
  const coverImage = allImages.find(img => img.isCover) || allImages[0];
  const displayImage = allImages[activeImage] || coverImage;



  return (
    <div className="listing-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link> &gt; 
        <Link to="/shop">Boutique</Link> &gt; 
        <span> {listing.title || "Annonce sans titre"}</span>
      </nav>

      <div className="listing-content">
        {/* Thumbnails - Colonne gauche */}
        {allImages.length > 1 && (
          <div className="image-thumbnails">
            {allImages.map((image, index) => (
              <button
                key={image._id || index}
                className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
                aria-label={`Voir l'image ${index + 1}`}
              >
                <img 
                  src={`http://localhost:4000${image.url}`}
                  alt={`${listing.title || "Annonce"} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80x80?text=Img";
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image - Colonne centre */}
        <div className="main-image">
          {displayImage ? (
            <img 
              src={`http://localhost:4000${displayImage.url}`}
              alt={listing.title || "Annonce"}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x600?text=Image+Non+Disponible";
              }}
            />
          ) : (
            <div className="no-image">
              <span>📷</span>
              <p>Pas d'image disponible</p>
            </div>
          )}
        </div>

        {/* Product Info - Colonne droite */}
        <div className="product-info">
          <h1 className="product-title">{listing.title || "Annonce sans titre"}</h1>
          <p className="product-price">{formatPrice(listing.price)}</p>


          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className="btn contact-btn"
              onClick={handleContactSeller}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Contacter le vendeur
            </button>
            
            <button 
              className="btn compare-btn"
              onClick={handleAddToCart}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              Ajouter au panier
            </button>

            <Link 
              to={`/compare/${listing._id}`} 
              className="btn compare-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Comparer le prix
            </Link>
          </div>

          {/* Meta Information */}
          <div className="product-meta">
            <div className="meta-item">
              <strong>Catégorie:</strong>
              <span>{formatCategory(listing.category)}</span>
            </div>
            
            {listing.condition && (
              <div className="meta-item">
                <strong>État:</strong>
                <span>{formatCondition(listing.condition)}</span>
              </div>
            )}
            
            {listing.phone && (
              <div className="meta-item">
                <strong>Téléphone:</strong>
                <span>
                  <a href={`tel:${listing.phone}`} className="phone-link">
                    {listing.phone}
                  </a>
                </span>
              </div>
            )}
            
            {listing.location && (
              <div className="meta-item">
                <strong>Localisation:</strong>
                <span>{formatLocation(listing.location)}</span>
              </div>
            )}
            
            {listing.createdAt && (
              <div className="meta-item">
                <strong>Publié le:</strong>
                <span>{new Date(listing.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>

          {/* Social Share */}
          <div className="social-share">
            <button 
              className="social-icon" 
              title="Partager sur Facebook"
              onClick={() => handleShare('facebook')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </button>
            <button 
              className="social-icon" 
              title="Partager sur LinkedIn"
              onClick={() => handleShare('linkedin')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </button>
            <button 
              className="social-icon" 
              title="Partager sur Twitter"
              onClick={() => handleShare('twitter')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </button>
          </div>

          {/* Description in sidebar */}
          {listing.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{listing.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informations supplémentaires
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Avis [0]
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <h3>Description du produit</h3>
              <p>{listing.description || "Aucune description disponible pour ce produit."}</p>
            </div>
          )}
          
          {activeTab === 'info' && (
            <div className="tab-panel">
              <h3>Informations supplémentaires</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Catégorie:</strong>
                  <span>{formatCategory(listing.category)}</span>
                </div>
                <div className="info-item">
                  <strong>Prix:</strong>
                  <span>{formatPrice(listing.price)}</span>
                </div>
                {listing.condition && (
                  <div className="info-item">
                    <strong>État:</strong>
                    <span>{formatCondition(listing.condition)}</span>
                  </div>
                )}
                {listing.location && (
                  <div className="info-item">
                    <strong>Localisation:</strong>
                    <span>{formatLocation(listing.location)}</span>
                  </div>
                )}
                {listing.createdAt && (
                  <div className="info-item">
                    <strong>Date de publication:</strong>
                    <span>{new Date(listing.createdAt).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <h3>Avis clients</h3>
              <div className="no-reviews">
                <p>📝 Aucun avis pour le moment.</p>
                <p>Soyez le premier à laisser un avis sur ce produit !</p>
                <button className="btn primary" style={{marginTop: '20px'}}>
                  Laisser un avis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}