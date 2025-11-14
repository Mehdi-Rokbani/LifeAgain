import React from 'react';

const CategoryCard = ({ category, onView }) => {
  if (!category) return null;

  const { name, nom, title, icon, parentCategory, parentName, isActive, createdAt, updatedAt } = category;
  const displayName = name || nom || title || '—';
  const displayParent = parentName || (parentCategory && (parentCategory.name || parentCategory.nom || parentCategory.title)) || null;

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-icon-wrapper">
          {icon ? (
            (icon.startsWith && (icon.startsWith('http://') || icon.startsWith('https://'))) ? (
              <img src={icon} alt={name} className="category-icon" />
            ) : (
              <div className="category-icon placeholder">{icon || name?.charAt(0)}</div>
            )
          ) : (
            <div className="category-icon placeholder">{name?.charAt(0)}</div>
          )}

          {/* status badge shown under the image as requested */}
          <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="category-info">
          <h4 className="category-name">{displayName}</h4>
        </div>
      </div>

      {/* Description + action: description on the left, button aligned right for clarity */}
      <div className="category-body">
        <div className="category-desc">
          <div className="desc-line"><span className="desc-label">Nom:</span> <span className="desc-value">{displayName}</span></div>
          <div className="desc-line"><span className="desc-label">Créée:</span> <span className="desc-value">{createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</span></div>
        </div>

        <div className="category-actions">
          {onView ? (
            <button
              className="details-btn"
              onClick={() => onView(category)}
              type="button"
              aria-label={`Voir détails de ${displayName}`}
            >
              Voir détails
            </button>
          ) : (
            <a className="details-btn" href={`/categories/${category._id || category.id}`} aria-label={`Voir détails de ${displayName}`}>Voir détails</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
