import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatedAd.css";

export default function CreateAd() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState([]);
  const [cover, setCover] = useState(null);
  
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const navigate = useNavigate();

  // 🔥 CORRECTION: Ajouter les nouvelles photos aux existantes
  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Vérifier qu'on ne dépasse pas 8 photos
    const totalPhotos = photos.length + newFiles.length;
    if (totalPhotos > 8) {
      alert(`Vous ne pouvez ajouter que ${8 - photos.length} photo(s) supplémentaire(s). Maximum 8 photos.`);
      return;
    }
    
    // 🔥 AJOUTER aux photos existantes (ne pas remplacer)
    setPhotos(prevPhotos => [...prevPhotos, ...newFiles]);
    
    // Créer des previews pour les nouvelles photos
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // 🔥 AJOUTER aux previews existantes (ne pas remplacer)
    setPhotoPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    
    // Réinitialiser l'input pour permettre de sélectionner à nouveau
    e.target.value = "";
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    setCover(file);
    
    // Preview de la cover
    if (file) {
      // Libérer l'ancien preview si existe
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverPreview(URL.createObjectURL(file));
    }
    
    // Réinitialiser l'input
    e.target.value = "";
  };

  // Supprimer une photo spécifique
  const removePhoto = (index) => {
    // Libérer l'URL de l'objet
    URL.revokeObjectURL(photoPreviews[index]);
    
    // Retirer la photo et son preview
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    setPhotoPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  // Supprimer la cover
  const removeCover = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCover(null);
    setCoverPreview(null);
  };

  // Nettoyer les URLs au démontage du composant
  React.useEffect(() => {
    return () => {
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!cover) {
      alert("Veuillez ajouter une photo de couverture");
      return;
    }
    
    const fd = new FormData();

    fd.append("title", title);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("phone", phone);
    fd.append("location", location);

    if (cover) fd.append("cover", cover);
    
    // Ajouter toutes les photos
    photos.forEach((p) => fd.append("photos", p));

    try {
      const res = await fetch("http://localhost:4000/api/listings", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      
      if (res.ok && data?.listing?._id) {
        // Nettoyer les previews avant de naviguer
        photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        
        navigate(`/listings/${data.listing._id}`);
      } else {
        alert("Erreur: " + (data.error || "Création échouée"));
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de l'annonce");
    }
  };

  return (
    <div className="create-page">

      {/* 🔥 HERO BANNER */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Créer une annonce</h1>
          <p>Home &gt; Shop</p>
        </div>
      </div>

      {/* 🔥 FORMULAIRE */}
      <div className="form-wrapper">
        <h2 className="form-title">Créer une annonce</h2>

        <form className="create-grid" onSubmit={handleSubmit}>

          <div className="field full">
            <label>Titre *</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Ex: iPhone 13 Pro Max"
            />
          </div>

          <div className="field full">
            <label>Catégorie *</label>
            <input 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required 
              placeholder="Ex: Électronique, Vêtements..."
            />
          </div>

          <div className="field full">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Décrivez votre article..."
            />
          </div>

         {/* 🔥 PHOTO DE COUVERTURE */}
<div className="field">
  <label>Photo de couverture *</label>
  
  {/* Input file caché */}
  <input 
    type="file" 
    accept="image/*" 
    onChange={handleCover}
    id="cover-input"
    style={{ display: 'none' }}
  />
  
  {/* Bouton personnalisé */}
  <label htmlFor="cover-input" className="custom-file-button">
     {cover ? "Changer la photo" : "Choisir un fichier"}
  </label>
  
  {/* Afficher le nom du fichier si sélectionné */}
  {cover && !coverPreview && (
    <span className="file-name">✓ {cover.name}</span>
  )}
  
  {/* Preview de la cover */}
  {coverPreview && (
    <div className="cover-preview-container">
      <div className="image-preview">
        <img src={coverPreview} alt="Cover preview" />
        <button 
          type="button" 
          className="remove-btn"
          onClick={removeCover}
          title="Supprimer">
          ❌
        </button>
      </div>
    </div>
  )}
</div>

{/* 🔥 PHOTOS SUPPLÉMENTAIRES */}
<div className="field">
  <label>Photos supplémentaires</label>
  
  {/* Input file caché */}
  <input 
    type="file" 
    multiple 
    accept="image/*" 
    onChange={handlePhotos}
    disabled={photos.length >= 8}
    id="photos-input"
    style={{ display: 'none' }}
  />
  
  {/* Bouton personnalisé */}
  <label 
    htmlFor="photos-input" 
    className={`custom-file-button ${photos.length >= 8 ? 'disabled' : ''}`}
  >
  {photos.length > 0 ? "Ajouter d'autres photos" : "Choisir des fichiers"}
  </label>
  
  {/* Compteur */}
  <small style={{ 
    color: photos.length >= 8 ? "#ff0000" : photos.length > 0 ? "#28a745" : "#666",
    fontWeight: photos.length >= 8 ? "600" : "400"
  }}>
    {photos.length}/8 photos sélectionnées
    {photos.length >= 8 && " (Maximum atteint)"}
  </small>
  
  {/* Preview des photos */}
  {photoPreviews.length > 0 && (
    <div className="photos-preview-grid">
      {photoPreviews.map((preview, index) => (
        <div key={index} className="image-preview">
          <img src={preview} alt={`Photo ${index + 1}`} />
          <button 
            type="button" 
            className="remove-btn"
            onClick={() => removePhoto(index)}
            title="Supprimer"
          >
            ❌
          </button>
          <span className="photo-number">{index + 1}</span>
        </div>
      ))}
    </div>
  )}
</div>

          <div className="field">
            <label>Prix (TND) *</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div className="field">
            <label>Numéro de téléphone *</label>
            <input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required
              min="8" 
              placeholder="+216 XX XXX XXX"
            />
          </div>

          <div className="field full">
            <label>Localisation *</label>
            <input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
              placeholder="Ex: Tunis, Ariana, Sousse..."
            />
          </div>

          <div className="submit-center">
            <button type="submit" className="submit-btn">
            Valider
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}