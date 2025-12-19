import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ListingDetails.css";
import { usePanier } from "../context/PanierContext";
import Header from "../components/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "../context/FavoriteContext";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { toggleFavorite, isFavorited } = useFavorites();

  // ---------------- STATE ----------------
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // ---------------- CONTEXT ----------------
  const { panier, addProduct } = usePanier();

  // ---------------- AUTH ----------------
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth?.user || auth;

  const userId = user?._id || user?.id;
  const isSeller = listing?.seller?._id === userId;

  // ---------------- MEMO ----------------
  const alreadyInCart = useMemo(() => {
    if (!panier || !listing) return false;
    return panier.items?.some(
      (item) => item.product?._id === listing._id
    );
  }, [panier, listing]);

  // ---------------- INCREMENT VIEWS ----------------
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/listings/${id}/views`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    }).catch(() => { });
  }, [id]);

  // ---------------- FETCH LISTING ----------------
  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/listings/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Annonce introuvable");
        }

        if (data.listing.status !== "available") {
          setError("Ce produit n'est plus disponible");
          return;
        }

        setListing(data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // ---------------- ACTIONS ----------------
  const handleAddToCart = async () => {
    if (!listing) return;

    if (alreadyInCart) {
      toast.info("🛒 Ce produit est déjà dans votre panier");
      return;
    }

    const success = await addProduct(listing._id);

    success
      ? toast.success("✅ Produit ajouté au panier")
      : toast.error("❌ Erreur lors de l'ajout au panier");
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isSeller) {
      toast.info("Vous ne pouvez pas ajouter votre propre produit en favori");
      return;
    }

    const result = await toggleFavorite(listing._id);

    if (result === true) toast.success("❤️ Ajouté aux favoris");
    if (result === false) toast.info("💔 Retiré des favoris");
  };

  const startChat = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isSeller) {
      toast.info("Vous êtes le vendeur de ce produit");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user2: listing.seller._id }),
      });

      const data = await res.json();

      if (res.ok) navigate("/chat");
      else toast.error(data.message || "Erreur création du chat");
    } catch {
      toast.error("Erreur réseau");
    }
  };

  // ---------------- STATES ----------------
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
        <Link to="/shop" className="btn primary">Retour</Link>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const mainImage = images[activeImage] || images[0];

  return (
    <div className="listing-detail">
      <Header />
      <ToastContainer position="top-right" autoClose={2500} />

      <nav className="breadcrumb">
        <Link to="/">Accueil</Link> &gt;
        <Link to="/shop">Boutique</Link> &gt;
        <span>{listing.title}</span>
      </nav>

      <div className="listing-content">
        {images.length > 1 && (
          <div className="image-thumbnails">
            {images.map((img, i) => (
              <button
                key={i}
                className={`thumbnail ${activeImage === i ? "active" : ""}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={`http://localhost:5000${img}`} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="main-image">
          <img src={`http://localhost:5000${mainImage}`} alt={listing.title} />
        </div>

        <div className="product-info">
          <div className="title-row">
            <h1>{listing.title}</h1>

            {!isSeller && (
              <button
                className="favorite-btn"
                onClick={handleToggleFavorite}
              >
                {isFavorited(listing._id) ? (
                  <FaHeart className="heart active" />
                ) : (
                  <FaRegHeart className="heart" />
                )}
              </button>
            )}
          </div>

          {listing.seller?.username && (
            <p className="seller-name">
              Vendeur : <strong>{listing.seller.username}</strong>
            </p>
          )}

          <p className="product-price">
            {listing.price} <span>TND</span>
          </p>

          {!isSeller && (
            <div className="product-actions">
              <button className="btn contact-btn" onClick={startChat}>
                💬 Contacter le vendeur
              </button>

              <button
                className={`btn compare-btn ${alreadyInCart ? "disabled" : ""}`}
                onClick={handleAddToCart}
                disabled={alreadyInCart}
              >
                {alreadyInCart ? "Déjà dans le panier" : "🛒 Ajouter au panier"}
              </button>

              <Link to={`/compare/${listing._id}`} className="btn compare-btn">
                🔍 Comparer le prix
              </Link>
            </div>
          )}

          <div className="product-meta">
            <span className="meta-badge">👁 {listing.views} vues</span>
            <span className="meta-badge">📦 {listing.condition}</span>
            <span className="meta-badge">🗂 {listing.category?.name}</span>
            <span className="meta-badge">
              📅 {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs-header">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            Informations
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && <p>{listing.description}</p>}
          {activeTab === "info" && (
            <>
              <p>Catégorie : {listing.category?.name}</p>
              <p>État : {listing.condition}</p>
              <p>Prix : {listing.price} TND</p>
              <p>Vendeur : {listing.seller?.username}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
