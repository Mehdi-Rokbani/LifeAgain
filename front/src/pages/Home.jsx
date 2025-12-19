import React, { useContext, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import CategoryCard from "../components/CategoryCard";
import { ShoppingBag, PlusCircle, ShieldCheck } from "lucide-react";
import "../assets/styles/home.css";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const { categories, loading } = useCategories();
  const { user } = useContext(AuthContext);
  const [showMore, setShowMore] = useState(false);

  // FILTER ONLY PARENT CATEGORIES
  const parentCategories = categories.filter(cat => !cat.parentCategory);
  const first3 = parentCategories.slice(0, 3);
  const rest = parentCategories.slice(3);

  // -----------------------------
  // ROLE-BASED CTA CONFIG
  // -----------------------------
  const getPrimaryCTA = () => {
    if (!user) {
      return {
        label: "Start Shopping",
        link: "/login",
        icon: <ShoppingBag size={18} />,
      };
    }

    if (user.role === "client") {
      return {
        label: "Shop Now",
        link: "/shop",
        icon: <ShoppingBag size={18} />,
      };
    }

    if (user.role === "seller") {
      return {
        label: "Create Listing",
        link: "/create-ad",
        icon: <PlusCircle size={18} />,
      };
    }

    if (user.role === "admin") {
      return {
        label: "Admin Dashboard",
        link: "/admin",
        icon: <ShieldCheck size={18} />,
      };
    }
  };

  const primaryCTA = getPrimaryCTA();

  return (
    <div className="home">
      <Header />

      {/* ================= HERO ================= */}
      <section className="hero-banner1">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">Marketplace</span>

            <h1 className="hero-title">
              Buy • Sell • Reuse<br />
              <span className="hero-title-accent">
                Give Products a Second Life
              </span>
            </h1>

            <p className="hero-description">
              LifeAgain connects buyers and sellers in a trusted
              marketplace built for reuse and sustainability.
            </p>

            <div className="hero-actions">
              <Link
                to={primaryCTA.link}
                className="hero-btn primary"
              >
                {primaryCTA.icon}
                <span>{primaryCTA.label}</span>
              </Link>

              {/* Optional secondary action */}
              {user?.role === "seller" && (
                <Link
                  to="/dashboard"
                  className="hero-btn secondary"
                >
                  View Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="hero-image">
            <ShoppingBag
              size={200}
              strokeWidth={1}
              className="hero-icon"
            />
          </div>
        </div>
      </section>


      {/* ================= stats ================= */}

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>10K+</h3>
            <p>Listings</p>
          </div>
          <div className="stat-card">
            <h3>2K+</h3>
            <p>Sellers</p>
          </div>
          <div className="stat-card">
            <h3>15K+</h3>
            <p>Orders Completed</p>
          </div>
          <div className="stat-card">
            <h3>24+</h3>
            <p>Cities</p>
          </div>
        </div>
      </section>


      {/* ================= CATEGORIES ================= */}
      <section className="browse-section">
        <h2 className="browse-title">Browse Categories</h2>
        <p className="browse-subtitle">
          Explore items by category and find exactly what you need
        </p>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Loading categories…
          </p>
        ) : (
          <>
            <div className="category-grid">
              {first3.map(cat => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>

            {showMore && (
              <div className="category-grid" style={{ marginTop: "1rem" }}>
                {rest.map(cat => (
                  <CategoryCard key={cat._id} category={cat} />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="browse-more">
                <button
                  className="show-more-btn"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="how-it-works">
        <h2>How LifeAgain Works</h2>

        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <h4>Browse or Sell</h4>
            <p>Explore products or create your own listing in seconds.</p>
          </div>

          <div className="step">
            <span className="step-number">2</span>
            <h4>Chat Securely</h4>
            <p>Talk directly with buyers or sellers using built-in chat.</p>
          </div>

          <div className="step">
            <span className="step-number">3</span>
            <h4>Confirm & Deliver</h4>
            <p>Confirm orders safely and complete transactions.</p>
          </div>
        </div>
      </section>



      {/* ================= USER REVIEWS ================= */}


      <section className="reviews-section">
        <h2>What Our Users Say</h2>

        <div className="reviews-grid">
          <div className="review-card">
            <p className="review-text">
              “LifeAgain made selling my unused items incredibly easy.”
            </p>
            <div className="review-author">
              <strong>Mehdi</strong>
              <span>Seller</span>
            </div>
          </div>

          <div className="review-card">
            <p className="review-text">
              “I found exactly what I needed and chatted with the seller instantly.”
            </p>
            <div className="review-author">
              <strong>Anas</strong>
              <span>Buyer</span>
            </div>
          </div>

          <div className="review-card">
            <p className="review-text">
              “Clean interface, secure orders, and fast communication.”
            </p>
            <div className="review-author">
              <strong>Yassine</strong>
              <span>Buyer</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
