import React, { useState, useEffect } from 'react';
import listingService from '../../services/listingService';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, selectedCategory, sortBy]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await listingService.getAllListings();
            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des produits');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Filtrer par catégorie
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category?.name === selectedCategory);
        }

        // Trier
        if (sortBy === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredProducts(filtered);
    };

    const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

    if (loading) {
        return <div className="shop-loading">Chargement des produits...</div>;
    }

    if (error) {
        return <div className="shop-error">Erreur : {error}</div>;
    }

    return (
        <div className="shop-page">
            {/* Hero Section */}
            <div className="shop-hero">
                <h1>Shop</h1>
                <p className="breadcrumb">
                    <span>Home</span> &gt; <span>Shop</span>
                </p>
            </div>

            {/* Filters Bar */}
            <div className="shop-filters">
                <div className="filter-group">
                    <label>Catégorie :</label>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Toutes les catégories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trier par :</label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="default">Par défaut</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="name">Nom A-Z</option>
                    </select>
                </div>

                <div className="results-count">
                    Affichage de {filteredProducts.length} résultats
                </div>
            </div>

            {/* Products Grid */}
            <div className="shop-container">
                <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    ) : (
                        <div className="no-products">
                            Aucun produit trouvé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;