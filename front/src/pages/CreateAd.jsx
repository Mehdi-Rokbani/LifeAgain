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
  const [condition, setCondition] = useState("used");
  const [photos, setPhotos] = useState([]);
  const [cover, setCover] = useState(null);
  
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState(""); // AJOUT: État pour l'erreur de prix
  
  const navigate = useNavigate();

  // Ajouter les nouvelles photos aux existantes
  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Vérifier qu'on ne dépasse pas 8 photos
    const totalPhotos = photos.length + newFiles.length;
    if (totalPhotos > 8) {
      alert(`Vous ne pouvez ajouter que ${8 - photos.length} photo(s) supplémentaire(s). Maximum 8 photos.`);
      return;
    }
    
    // Ajouter aux photos existantes
    setPhotos(prevPhotos => [...prevPhotos, ...newFiles]);
    
    // Créer des previews pour les nouvelles photos
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Ajouter aux previews existantes
    setPhotoPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    
    // Réinitialiser l'input
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

  // Validation du prix
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    
    // Validation en temps réel
    if (value === "" || value === "0") {
      setPriceError("Le prix doit être supérieur à 0");
    } else if (parseFloat(value) <= 0) {
      setPriceError("Le prix doit être supérieur à 0");
    } else {
      setPriceError("");
    }
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
    
    // Validation du prix avant soumission
    const priceNum = parseFloat(price);
    if (!price || priceNum <= 0) {
      setPriceError("Veuillez entrer un prix supérieur à 0");
      return;
    }
    
    // Validation de la photo de couverture
    if (!cover) {
      //alert("Veuillez ajouter une photo de couverture");
      return;
    }
    
    setIsSubmitting(true);
    
    const fd = new FormData();

    fd.append("title", title);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("phone", phone);
    fd.append("location", location);
    fd.append("condition", condition);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page">

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Créer une annonce</h1>
          <p>Home &gt; Créer une annonce</p>
        </div>
      </div>

      {/* Form Wrapper */}
      <div className="form-wrapper">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Créer votre annonce</h2>
            <p className="form-subtitle">Remplissez les informations ci-dessous</p>
          </div>

          <form className="create-grid" onSubmit={handleSubmit}>

            {/* Titre */}
            <div className="field">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Titre de l'annonce *
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Ex: iPhone 13 Pro Max 256GB"
              />
            </div>

            {/* Catégorie */}
            <div className="field">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Catégorie *
              </label>
              <input 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
                placeholder="Ex: Électronique, Vêtements, Maison..."
              />
            </div>

            {/* Description */}
            <div className="field">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Description
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                placeholder="Décrivez votre article en détail..."
              />
            </div>

            {/* Photo de couverture et Photos supplémentaires */}
            <div className="photos-container">
{/* Photo de couverture */}
<div className="field photo-section">
  <label>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    Photo de couverture *
  </label>
  
  <input 
    type="file" 
    accept="image/*" 
    onChange={handleCover}
    id="cover-input"
  />
  
  <label htmlFor="cover-input" className="custom-file-button">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    {cover ? "Changer la photo" : "Choisir une photo"}
  </label>
  
  {/* AJOUT: Message d'erreur pour la photo de couverture */}
  {!cover && (
    <div className="cover-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Veuillez ajouter une photo de couverture
    </div>
  )}
  
  {coverPreview && (
    <div className="cover-preview-container">
      <div className="image-preview">
        <img src={coverPreview} alt="Cover preview" />
        <button 
          type="button" 
          className="remove-btn"
          onClick={removeCover}
          title="Supprimer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )}
</div>

              {/* Photos supplémentaires */}
              <div className="field photo-section">
                <label>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Photos supplémentaires
                </label>
                
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handlePhotos}
                  disabled={photos.length >= 8}
                  id="photos-input"
                />
                
                <label 
                  htmlFor="photos-input" 
                  className={`custom-file-button ${photos.length >= 8 ? 'disabled' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {photos.length > 0 ? "Ajouter d'autres photos" : "Choisir des photos"}
                </label>

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
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                        <span className="photo-number">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <small className={`photo-counter ${photos.length >= 8 ? 'danger' : photos.length > 0 ? 'success' : 'default'}`}>
                  {photos.length}/8 photos sélectionnées
                  {photos.length >= 8 && " (Maximum atteint)"}
                </small>
              </div>
            </div>

            {/* Prix et Téléphone */}
            <div className="fields-row">
              <div className="field">
                <label>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Prix (TND) *
                </label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={handlePriceChange} // MODIFICATION: Utiliser la nouvelle fonction
                  required 
                  min="0.01" // MODIFICATION: Minimum à 0.01
                  step="0.01"
                  placeholder="0.00"
                  className={priceError ? "error" : ""} // AJOUT: Classe d'erreur
                />
                {priceError && ( // AJOUT: Affichage de l'erreur
                  <div className="error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {priceError}
                  </div>
                )}
              </div>

              <div className="field">
                <label>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Téléphone *
                </label>
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                  placeholder="+216 XX XXX XXX"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="field">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Localisation *
              </label>
              <input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
                placeholder="Ex: Tunis, Ariana, Sousse..."
              />
            </div>

            {/* Submit Button */}
            <div className="submit-center">
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isSubmitting || priceError || !price || parseFloat(price) <= 0} // MODIFICATION: Désactiver si erreur de prix
              >
                {isSubmitting ? "Publication en cours..." : "Valider"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}