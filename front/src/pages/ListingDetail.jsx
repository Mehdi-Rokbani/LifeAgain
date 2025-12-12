import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ListingDetails.css";
import { usePanier } from "../context/PanierContext";
import Header from "../components/Header";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const { addProduct } = usePanier();

  // Logged user
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth?.user || auth;

  // -------------------------
  // ADD TO CART
  // -------------------------
  const handleAddToCart = async () => {
    const success = await addProduct(listing._id);
    success
      ? alert("Produit ajouté au panier !")
      : alert("Erreur lors de l'ajout au panier");
  };

  // -------------------------
  // CREATE CHAT WITH SELLER
  // -------------------------
  const startChat = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user2: listing.seller, // seller ID from DB
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/chat");
      } else {
        alert(data.message || "Erreur lors de la création du chat");
      }
    } catch (err) {
      alert("Erreur réseau, impossible de créer la conversation");
    }
  };

  // -------------------------
  // FETCH LISTING
  // -------------------------
  useEffect(() => {
    if (!id || id === "undefined") {
      setError("ID invalide");
      setLoading(false);
      navigate("/");
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);

        const response = await fetch(`http://localhost:5000/api/listings/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) throw new Error(data.error);

        setListing(data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const formatPrice = (price) => `${price} TND`;

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const title = listing?.title;

    const share = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    };

    window.open(share[platform], "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error || "Annonce introuvable"}</p>
        <Link to="/" className="btn primary">Retour</Link>
      </div>
    );
  }

  // -------------------------
  // IMAGE HANDLING
  // -------------------------
  const allImages = Array.isArray(listing.images) ? listing.images : [];

  const displayImage = allImages[activeImage] || allImages[0] || null;

  return (
    <div className="listing-detail">
      <Header />

      {/* BREADCRUMB */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link> &gt;
        <Link to="/shop">Boutique</Link> &gt;
        <span>{listing.title}</span>
      </nav>

      <div className="listing-content">

        {/* THUMBNAILS */}
        {allImages.length > 1 && (
          <div className="image-thumbnails">
            {allImages.map((url, index) => (
              <button
                key={index}
                className={`thumbnail ${activeImage === index ? "active" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={`http://localhost:5000${url}`}
                  alt={`Image ${index + 1}`}
                  onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/80x80?text=IMG")
                  }
                />
              </button>
            ))}
          </div>
        )}

        {/* MAIN IMAGE */}
        <div className="main-image">
          {displayImage ? (
            <img
              src={`http://localhost:5000${displayImage}`}
              alt={listing.title}
              onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/600x600?text=Aucune+image")
              }
            />
          ) : (
            <div className="no-image">Aucune image disponible</div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="product-info">
          <h1 className="product-title">{listing.title}</h1>
          <p className="product-price">{formatPrice(listing.price)}</p>

          {/* ACTION BUTTONS */}
          <div className="product-actions">

            {/* CHAT WITH SELLER */}
            <button className="btn contact-btn" onClick={startChat}>
              Contacter le vendeur
            </button>

            <button className="btn compare-btn" onClick={handleAddToCart}>
              Ajouter au panier
            </button>

            <Link to={`/compare/${listing._id}`} className="btn compare-btn">
              Comparer le prix
            </Link>
          </div>

          {/* META INFO */}
          <div className="product-meta">
            <div><strong>Catégorie:</strong> {listing.category?.name}</div>
            <div><strong>État:</strong> {listing.condition}</div>
            <div><strong>Publié:</strong> {new Date(listing.createdAt).toLocaleDateString("fr-FR")}</div>
          </div>

          {/* SOCIAL SHARE */}
          <div className="social-share">
            <button className="social-icon" onClick={() => handleShare("facebook")}>Fb</button>
            <button className="social-icon" onClick={() => handleShare("linkedin")}>In</button>
            <button className="social-icon" onClick={() => handleShare("twitter")}>Tw</button>
          </div>

          {/* DESCRIPTION */}
          {listing.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{listing.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Informations
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-panel">
              <h3>Description du produit</h3>
              <p>{listing.description}</p>
            </div>
          )}

          {activeTab === "info" && (
            <div className="tab-panel">
              <h3>Informations supplémentaires</h3>
              <p>Catégorie : {listing.category?.name}</p>
              <p>État : {listing.condition}</p>
              <p>Prix : {formatPrice(listing.price)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
