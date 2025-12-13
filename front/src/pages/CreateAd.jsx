import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatedAd.css";
import Header from "../components/Header";
import { useCategories } from "../hooks/useCategories";
import { useAddress } from "../hooks/useAddress";
import { AuthContext } from "../context/AuthContext";

export default function CreateAd() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { categories } = useCategories();
  const { getAddresses } = useAddress();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [condition, setCondition] = useState("used");

  const [photos, setPhotos] = useState([]);
  const [cover, setCover] = useState(null);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState("");

  // LOAD ADDRESSES
  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await getAddresses();
      setAddresses(Array.isArray(res) ? res : (res.addresses || []));
      console.log("User Addresses:", res);
    };

    fetchAddresses();
  }, []);

  // PARENT CATEGORIES
  const parentCategories = categories.filter(cat => !cat.parentCategory);

  // COVER UPLOAD
  const handleCover = (e) => {
    const file = e.target.files[0];
    setCover(file);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (file) setCoverPreview(URL.createObjectURL(file));

    e.target.value = "";
  };

  // MULTIPLE PHOTOS
  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files);

    if (photos.length + newFiles.length > 8) {
      alert("Max 8 photos.");
      return;
    }

    setPhotos(prev => [...prev, ...newFiles]);
    setPhotoPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);

    e.target.value = "";
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);

    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCover(null);
    setCoverPreview(null);
  };

  // PRICE VALIDATION
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);

    if (!value || parseFloat(value) <= 0) {
      setPriceError("Le prix doit être supérieur à 0");
    } else {
      setPriceError("");
    }
  };

  // SUBMIT LISTING
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cover) {
      alert("Veuillez ajouter une photo de couverture");
      return;
    }

    if (!selectedAddress) {
      alert("Veuillez sélectionner une adresse");
      return;
    }

    if (!user.phone && !phone) {
      alert("Veuillez entrer un numéro de téléphone");
      return;
    }

    setIsSubmitting(true);

    const fd = new FormData();

    fd.append("title", title);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("category", category);
    fd.append("condition", condition);
    fd.append("address", selectedAddress);
    fd.append("phone", user.phone || phone);
    fd.append("seller", user.id);

    if (cover) fd.append("cover", cover);
    photos.forEach((p) => fd.append("photos", p));

    console.log("🔥 COVER FILE SENT:", cover);
    console.log("🔥 PHOTOS SENT:", photos);

    try {
      const res = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (res.ok && data?.listing?._id) {
        navigate(`/listings/${data.listing._id}`);
      } else {
        alert("Erreur: " + (data.error || "Création échouée"));
      }
    } catch (err) {
      console.log("Creation Error:", err);
      alert("Erreur lors de la création de l'annonce");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI
  return (
    <div className="create-page">
      <Header />

      <div className="hero-banner">
        <div className="hero-text">
          <h1>Créer une annonce</h1>
          <p>Home › Créer une annonce</p>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-container">
          <form
            className="create-grid"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            {/* Section 1: Informations de base */}
            <div className="form-section">
              <h2 className="section-title">📝 Informations de base</h2>

              <div className="field-row">
                <div className="field">
                  <label>Titre de l'annonce *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: iPhone 13 Pro Max en excellent état"
                    required
                  />
                </div>

                <div className="field">
                  <label>Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Choisir une catégorie</option>
                    {parentCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Description détaillée *</label>
                <textarea
                  value={description}
                  rows="5"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre article en détail: état, caractéristiques, raison de la vente..."
                  required
                />
                <small className="field-hint">
                  {description.length}/500 caractères
                </small>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Prix (TND) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={handlePriceChange}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  {priceError && <p className="error">{priceError}</p>}
                </div>

                <div className="field">
                  <label>État du produit *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="new">Neuf</option>
                    <option value="used">Occasion</option>
                    <option value="refurbished">Reconditionné</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Photos */}
            <div className="form-section">
              <h2 className="section-title">📷 Photos du produit</h2>

              <div className="field">
                <label>Photo de couverture * (Photo principale)</label>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    name="cover"
                    onChange={handleCover}
                    id="cover-input"
                    className="file-input"
                  />
                  <label htmlFor="cover-input" className="upload-label">
                    <div className="upload-icon">📸</div>
                    <p>Cliquez pour ajouter une photo de couverture</p>
                    <small>PNG, JPG jusqu'à 5MB</small>
                  </label>
                </div>

                {coverPreview && (
                  <div className="image-preview cover-preview">
                    <img src={coverPreview} alt="Cover" />
                    <button type="button" onClick={removeCover} className="remove-btn">
                      ✕ Supprimer
                    </button>
                  </div>
                )}
              </div>

              <div className="field">
                <label>Photos supplémentaires (max 8)</label>
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    name="photos"
                    onChange={handlePhotos}
                    id="photos-input"
                    className="file-input"
                  />
                  <label htmlFor="photos-input" className="upload-label">
                    <div className="upload-icon">🖼️</div>
                    <p>Ajoutez jusqu'à 8 photos supplémentaires</p>
                    <small>{photos.length}/8 photos ajoutées</small>
                  </label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="photos-preview-grid">
                    {photoPreviews.map((p, i) => (
                      <div className="image-preview" key={i}>
                        <img src={p} alt={`Photo ${i + 1}`} />
                        <button type="button" onClick={() => removePhoto(i)} className="remove-btn">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Contact et localisation */}
            <div className="form-section">
              <h2 className="section-title">📍 Contact et localisation</h2>

              {!user.phone && (
                <div className="field">
                  <label>Téléphone *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 12 345 678"
                    required
                  />
                </div>
              )}

              <div className="field">
                <label>Adresse de retrait *</label>

                {addresses.length === 0 ? (
                  <div className="no-address-warning">
                    <div className="warning-icon">⚠️</div>
                    <div>
                      <p>Vous devez d'abord ajouter une adresse dans votre profil.</p>
                      <button
                        type="button"
                        className="auth-btn"
                        onClick={() => navigate("/profile")}
                      >
                        Ajouter une adresse
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    required
                  >
                    <option value="">Choisir une adresse</option>

                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.street}, {addr.city} {addr.postalCode}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Publication en cours...
                </>
              ) : (
                <>
                  ✓ Publier l'annonce
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}