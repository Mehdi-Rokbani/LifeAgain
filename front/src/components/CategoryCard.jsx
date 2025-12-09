import React from "react";
import "../assets/styles/home.css";

export default function CategoryCard({ category }) {
  return (
    <div className="category-card">
      <div className="category-image-wrapper">
        <img
          src={category.image || "/placeholder.jpg"}
          alt={category.name}
          className="category-image"
        />
      </div>
      <h3 className="category-name">{category.name}</h3>
    </div>
  );
}