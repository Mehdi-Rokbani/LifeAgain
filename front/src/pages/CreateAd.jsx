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

  // ============================
  // LOAD ADDRESSES
  // ============================
  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await getAddresses();
      setAddresses(Array.isArray(res) ? res : (res.addresses || []));
      console.log("User Addresses:", res);
    };

    fetchAddresses();
  }, []);

  // ============================
  // PARENT CATEGORIES
  // ============================
  const parentCategories = categories.filter(cat => !cat.parentCategory);

  // ============================
  // COVER UPLOAD
  // ============================
  const handleCover = (e) => {
    const file = e.target.files[0];
    setCover(file);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (file) setCoverPreview(URL.createObjectURL(file));

    e.target.value = "";
  };

  // ============================
  // MULTIPLE PHOTOS
  // ============================
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

  // ============================
  // PRICE VALIDATION
  // ============================
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);

    if (!value || parseFloat(value) <= 0) {
      setPriceError("Le prix doit être supérieur à 0");
    } else {
      setPriceError("");
    }
  };

  // ============================
  // SUBMIT LISTING
  // ============================
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

    // DEBUG LOGS FOR TESTING
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

  // ============================
  // UI
  // ============================
  return (
    <div className="create-page">
      <Header></Header>
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Créer une annonce</h1>
          <p>Home &gt; Créer une annonce</p>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-container">

          {/* IMPORTANT: encType added */}
          <form
            className="create-grid"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >

            {/* TITLE */}
            <div className="field">
              <label>Titre *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* CATEGORY */}
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

            {/* DESCRIPTION */}
            <div className="field">
              <label>Description *</label>
              <textarea
                value={description}
                rows="4"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* COVER IMAGE */}
            <div className="field">
              <label>Photo de couverture *</label>

              <input
                type="file"
                accept="image/*"
                name="cover"
                onChange={handleCover}
              />

              {coverPreview && (
                <div className="image-preview">
                  <img src={coverPreview} alt="Cover" />
                  <button type="button" onClick={removeCover}>
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* ADDITIONAL PHOTOS */}
            <div className="field">
              <label>Photos supplémentaires</label>

              <input
                type="file"
                accept="image/*"
                multiple
                name="photos"
                onChange={handlePhotos}
              />

              <div className="photos-preview-grid">
                {photoPreviews.map((p, i) => (
                  <div className="image-preview" key={i}>
                    <img src={p} alt="" />
                    <button type="button" onClick={() => removePhoto(i)}>
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="field">
              <label>Prix (TND) *</label>
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                min="0.01"
                step="0.01"
                required
              />
              {priceError && <p className="error">{priceError}</p>}
            </div>

            {/* PHONE IF USER HAS NONE */}
            {!user.phone && (
              <div className="field">
                <label>Téléphone *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+216 xx xxx xxx"
                  required
                />
              </div>
            )}

            {/* ADDRESS */}
            <div className="field">
              <label>Adresse *</label>

              {addresses.length === 0 ? (
                <>
                  <p style={{ color: "red" }}>
                    Vous devez d'abord ajouter une adresse dans votre profil.
                  </p>

                  <button
                    type="button"
                    className="auth-btn"
                    onClick={() => navigate("/profile")}
                  >
                    Ajouter une adresse
                  </button>
                </>
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

            {/* SUBMIT BUTTON */}
            <button className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Publication..." : "Publier l'annonce"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
