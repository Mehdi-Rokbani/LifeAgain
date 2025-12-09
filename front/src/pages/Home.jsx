import React from "react";
import { useCategories } from "../hooks/useCategories";
import CategoryCard from "../components/CategoryCard";
import { ShoppingBag } from "lucide-react";
import "../assets/styles/home.css";
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link } from "react-router-dom";

export default function Home() {
  const { categories, loading } = useCategories();
  const { storedUser } = useContext(AuthContext);

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">New Arrival</span>
            <h1 className="hero-title">
              Discover Our<br />
              <span className="hero-title-accent">New Collection</span>
            </h1>
            <p className="hero-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              elit tellus, luctus nec ullamcorper mattis.
            </p>
            <button className="hero-btn">
              <Link
                to={storedUser ? "/products" : "/login"}
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

      {/* Make Your First Sale Section */}
      <section className="first-sale-section">
        <div className="sale-content">
          <div className="sale-images-grid">
            <div className="sale-img sale-img-1"></div>
            <div className="sale-img sale-img-2"></div>
            <div className="sale-img sale-img-3"></div>
            <div className="sale-img sale-img-4"></div>
            <div className="sale-img sale-img-5"></div>
            <div className="sale-img sale-img-6"></div>
            <div className="sale-img sale-img-7"></div>
            <div className="sale-img sale-img-8"></div>
          </div>

          <div className="sale-text-box">
            <p className="sale-hashtag">#make your first sell</p>
            <h2 className="sale-with">with</h2>
            <h1 className="sale-logo">LIFEAGAIN</h1>

            <div className="sale-cta">
              <h3 className="sale-title">MAKE YOUR<br />FIRST Sale</h3>
              <p className="sale-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tel
              </p>
              <button className="sale-btn"><Link
                to={storedUser ? "/products" : "/login"}
                className="hero-btn"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                TRY NOW
              </Link></button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="browse-section">
        <h2 className="browse-title">Browse The Range</h2>
        <p className="browse-subtitle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading categories...</p>
        ) : (
          <>
            <div className="category-grid">
              {categories.slice(0, 3).map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>

            <div className="browse-more">
              <button className="show-more-btn">Show More</button>
            </div>
          </>
        )}
      </section>

    </div>
  );
}