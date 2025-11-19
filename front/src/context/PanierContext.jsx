import React, { createContext, useState, useContext, useEffect } from 'react';
import panierService from '../services/panierService';

const PanierContext = createContext();

export const usePanier = () => {
    const context = useContext(PanierContext);
    if (!context) {
        throw new Error('usePanier doit être utilisé dans PanierProvider');
    }
    return context;
};

export const PanierProvider = ({ children }) => {
    const [panier, setPanier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ID utilisateur (à remplacer par l'authentification réelle plus tard)
    const userId = "690fc01ccbb891b31ec1df69";

    // Charger le panier
    const loadPanier = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await panierService.getPanierByUser(userId);
            setPanier(data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement du panier');
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un produit
    const addProduct = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await panierService.addProductToPanier(userId, productId);
            setPanier(updated);
            return true;
        } catch (err) {
            setError(err.message || "Erreur lors de l'ajout");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Retirer un produit
    const removeProduct = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await panierService.removeProductFromPanier(userId, productId);
            setPanier(updated);
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour la quantité
    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await panierService.updateQuantity(userId, productId, quantity);
            setPanier(updated);
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    // Charger le panier au montage
    useEffect(() => {
        loadPanier();
    }, []);

    const value = {
        panier,
        loading,
        error,
        loadPanier,
        addProduct,
        removeProduct,
        updateQuantity,
        itemCount: panier?.items?.length || 0,
        totalPrice: panier?.totalPrice || 0
    };

    return (
        <PanierContext.Provider value={value}>
            {children}
        </PanierContext.Provider>
    );
};