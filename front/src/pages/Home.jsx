import React, { useState, useEffect } from "react";
import { getCategories } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import Footer from "../components/Footer";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import homeImage from "../assets/home.png";
import home1Image from "../assets/home1.png";
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        
        if (!Array.isArray(data)) {
          setCategories([]);
          return;
        }

        const normalizedCategories = data.map(category => ({
          id: category._id || category.id,
          name: category.name || category.nom || category.title || 'Sans nom',
          icon: category.icon,
          isActive: category.isActive !== undefined ? category.isActive : true,
          createdAt: category.createdAt,
          parentCategory: category.parentCategory,
          ...category
        }));

        setCategories(normalizedCategories);
        setError(null);
      } catch (err) {
        console.error("Error loading categories", err);
        setError(err?.message || "Erreur lors du chargement des catégories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Navigation du slider
  const nextSlide = () => {
    if (currentSlide + 3 < categories.length) {
      setCurrentSlide(currentSlide + 3);
    }
  };

  const prevSlide = () => {
    if (currentSlide - 3 >= 0) {
      setCurrentSlide(currentSlide - 3);
    }
  };

  // Catégories visibles (3 maximum)
  const visibleCategories = categories.slice(currentSlide, currentSlide + 3);

  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar /> 

      {/* Image home.png */}
      <div className="home-hero-image">
        <img 
          src={homeImage} 
          alt="Accueil LIFEAGAIN" 
          className="hero-image"
        />
      </div>

      {/* Catégories Slider */}
      <div className="categories-section">
        <h2>Nos Catégories</h2>
        
        {loading ? (
          <p>Chargement des catégories...</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : categories.length === 0 ? (
          <p>Aucune catégorie trouvée.</p>
        ) : (
          <div className="categories-slider-container">
            {/* Flèche gauche */}
            <button 
              className="slider-arrow slider-arrow-left"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              ‹
            </button>

            {/* Conteneur des catégories */}
            <div className="categories-grid">
              {visibleCategories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>

            {/* Flèche droite */}
            <button 
              className="slider-arrow slider-arrow-right"
              onClick={nextSlide}
              disabled={currentSlide + 3 >= categories.length}
            >
              ›
            </button>
          </div>
        )}
      </div>
{/* Nouvelle image home1.png */}
      <div className="home-bottom-image">
        <img 
          src={home1Image} 
          alt="LIFEAGAIN Collection" 
          className="bottom-hero-image"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;