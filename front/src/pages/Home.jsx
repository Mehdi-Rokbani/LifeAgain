import React, { useContext, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import CategoryCard from "../components/CategoryCard";
import { ShoppingBag } from "lucide-react";
import "../assets/styles/home.css";
import { AuthContext } from '../context/AuthContext';
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  const { categories, loading } = useCategories();
  const { user } = useContext(AuthContext);

  // state to show/hide the rest
  const [showMore, setShowMore] = useState(false);

  // FILTER ONLY PARENT CATEGORIES
  const parentCategories = categories.filter(cat => !cat.parentCategory);

  // FIRST 3
  const first3 = parentCategories.slice(0, 3);

  // THE REST
  const rest = parentCategories.slice(3);

  return (
    <div className="home">
      <Header />

      {/* Hero Section */}
      <section className="hero-banner1">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">New Arrival</span>
            <h1 className="hero-title">
              Discover Our<br />
              <span className="hero-title-accent">New Collection</span>
            </h1>
            <p className="hero-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>

            <button className="hero-btn">
              <Link
                to={user ? "/shop" : "/login"}
                className="hero-btn"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                BUY NOW
              </Link>
            </button>
          </div>

          <div className="hero-image">
            <ShoppingBag size={200} strokeWidth={1} className="hero-icon" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="browse-section">
        <h2 className="browse-title">Browse The Range</h2>
        <p className="browse-subtitle">
          Explore our marketplace categories
        </p>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading categories...</p>
        ) : (
          <>
            {/* First 3 Parent Categories */}
            <div className="category-grid">
              {first3.map(cat => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>

            {/* Expandable Section */}
            {showMore && (
              <div className="category-grid" style={{ marginTop: "1rem" }}>
                {rest.map(cat => (
                  <CategoryCard key={cat._id} category={cat} />
                ))}
              </div>
            )}

            <div className="browse-more">
              <button
                className="show-more-btn"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
