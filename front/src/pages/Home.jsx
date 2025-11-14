import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { getCategories } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import Footer from "../components/Footer";
// Removed product/search UI — this page now only displays categories

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger les catégories uniquement et enrichir avec le nom du parent (si présent)
    getCategories()
      .then((data) => {
        if (!Array.isArray(data)) return setCategories([]);
        // créer un mapping id -> name
        const idNameMap = {};
        data.forEach((c) => {
          const id = c._id || c.id;
          if (id) idNameMap[id] = c.name || c.nom || c.title || null;
        });

        const enriched = data.map((c) => {
          // parentCategory may be populated object or id string
          let parentName = null;
          if (c.parentCategory) {
            if (typeof c.parentCategory === 'object') {
              parentName = c.parentCategory.name || c.parentCategory.nom || c.parentCategory.title || null;
            } else {
              parentName = idNameMap[c.parentCategory] || null;
            }
          }
          return { ...c, parentName };
        });

            setCategories(enriched);
          })
          .catch((err) => {
            console.error('Error loading categories', err);
            setError(err?.message || 'Erreur lors du chargement');
            setCategories([]);
          })
          .finally(() => setLoading(false));
  }, []);

  // filter categories by search term (case-insensitive)
  const filteredCategories = categories.filter((c) => {
    const name = (c.name || c.nom || c.title || '').toLowerCase();
    return name.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div className="home-container">
      {/* Header: logo + search box */}
      <div className="home-header">
        <img
          src={logo}
          alt="logo"
          className="site-logo"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="category-search"
        />
      </div>

      {/* Séction catégories : afficher les catégories sous forme de cartes */}
      <h2 className="categories-title">Catégories</h2>
      <div className="categories-grid">
        {loading ? (
          <p>Chargement des catégories...</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : filteredCategories.length === 0 ? (
          <p>Aucune catégorie trouvée.</p>
        ) : (
          filteredCategories.map((cat) => (
            <CategoryCard key={cat._id || cat.id} category={cat} />
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
