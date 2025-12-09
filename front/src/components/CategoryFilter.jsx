import React from 'react';

const CategoryFilter = ({ categories = [], selected = '', onChange }) => {
  return (
    <div className="category-filter">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="category-select"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c._id || c.id} value={c._id || c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
