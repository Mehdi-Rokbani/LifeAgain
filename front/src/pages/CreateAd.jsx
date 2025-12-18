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

  // ---------------- STATES ----------------
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [condition, setCondition] = useState("used");

  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- DATA ----------------
  useEffect(() => {
    (async () => {
      const res = await getAddresses();
      setAddresses(Array.isArray(res) ? res : res.addresses || []);
    })();
  }, []);

  const getParentId = (c) =>
    typeof c.parentCategory === "object" ? c.parentCategory?._id : c.parentCategory;

  const parentCategories = categories.filter((c) => !getParentId(c));
  const subCategories = categories.filter(
    (c) => getParentId(c) === parentCategoryId
  );

  // ---------------- PRICE ----------------
  const handlePriceChange = (e) => {
    const v = e.target.value;
    setPrice(v);
    setPriceError(!v || Number(v) < 0.5 ? "Minimum 0.5 TND" : "");
  };

  // ---------------- COVER ----------------
  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeCover = () => {
    URL.revokeObjectURL(coverPreview);
    setCover(null);
    setCoverPreview(null);
  };

  // ---------------- PHOTOS ----------------
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 8) return alert("Max 8 photos");

    setPhotos((p) => [...p, ...files]);
    setPhotoPreviews((p) => [...p, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removePhoto = (i) => {
    URL.revokeObjectURL(photoPreviews[i]);
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPhotoPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (priceError) return alert(priceError);
    if (!cover) return alert("Photo de couverture requise");
    if (!subCategoryId) return alert("Sous-catégorie requise");
    if (!selectedAddress) return alert("Adresse requise");

    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("category", subCategoryId);
    fd.append("condition", condition);
    fd.append("address", selectedAddress);
    fd.append("phone", user.phone || phone);
    fd.append("cover", cover);
    photos.forEach(p => fd.append("photos", p));

    try {
      const res = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) navigate(`/listings/${data.listing._id}`);
      else alert(data.error || "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="create-page">
      <Header />

      <div className="create-container">
        <h1>Créer une annonce</h1>

        <form className="card" onSubmit={handleSubmit}>

          {/* BASIC INFO */}
          <div className="section">
            <h2>Informations</h2>

            <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required />

            <div className="row">
              <div className="field">
                <select
                  value={parentCategoryId}
                  onChange={(e) => {
                    setParentCategoryId(e.target.value);
                    setSubCategoryId("");
                  }}
                  required
                >
                  <option value="">Catégorie</option>
                  {parentCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  disabled={!parentCategoryId}
                  required
                >
                  <option value="">Sous-catégorie</option>
                  {subCategories.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>


            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />

            <div className="row">
              <div className="field">
                <input
                  type="number"
                  min="0.5"
                  step="0.01"
                  placeholder="Prix (TND)"
                  value={price}
                  onChange={handlePriceChange}
                  required
                />
                {priceError && <span className="error">{priceError}</span>}
              </div>

              <div className="field">
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                >
                  <option value="new">Neuf</option>
                  <option value="used">Occasion</option>
                  <option value="refurbished">Reconditionné</option>
                </select>
              </div>
            </div>


          </div>

          {/* IMAGES */}
          <div className="section">
            <h2>Photos</h2>

            <label className="upload-box">
              Ajouter photo de couverture
              <input type="file" accept="image/*" hidden onChange={handleCover} />
            </label>

            {coverPreview && (
              <div className="image-card">
                <img src={coverPreview} />
                <button type="button" onClick={removeCover}>✕</button>
              </div>
            )}

            <label className="upload-box">
              Ajouter photos (max 8)
              <input type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
            </label>

            <div className="image-grid">
              {photoPreviews.map((p, i) => (
                <div className="image-card" key={i}>
                  <img src={p} />
                  <button type="button" onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div className="section">
            <h2>Contact</h2>

            {!user.phone && (
              <input placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
            )}

            <select value={selectedAddress} onChange={e => setSelectedAddress(e.target.value)} required>
              <option value="">Adresse</option>
              {addresses.map(a => (
                <option key={a._id} value={a._id}>
                  {a.street}, {a.city}
                </option>
              ))}
            </select>
          </div>

          <button className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Publication..." : "Publier"}
          </button>

        </form>
      </div>
    </div>
  );
}
