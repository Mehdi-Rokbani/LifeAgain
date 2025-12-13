import React, { createContext, useContext, useEffect, useState } from "react";
import panierService from "../services/panierService";

const PanierContext = createContext(null);

export const usePanier = () => {
    const ctx = useContext(PanierContext);
    if (!ctx) {
        throw new Error("usePanier must be used inside PanierProvider");
    }
    return ctx;
};

export const PanierProvider = ({ children }) => {
    const [panier, setPanier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --------------------------------------------------
    // LOAD PANIER (FROM TOKEN)
    // --------------------------------------------------
    const loadPanier = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await panierService.getMyPanier();

            setPanier(data || null);
        } catch (err) {
            setPanier(null);
            setError(err?.message || "Erreur chargement panier");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // ADD PRODUCT (USED MARKETPLACE → 1 ONLY)
    // --------------------------------------------------
    const addProduct = async (productId) => {
        try {
            setLoading(true);
            setError(null);

            const updatedPanier = await panierService.addProduct(productId);
            setPanier(updatedPanier);

            return true;
        } catch (err) {
            setError(err?.message || "Impossible d'ajouter le produit");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // REMOVE PRODUCT
    // --------------------------------------------------
    const removeProduct = async (productId) => {
        try {
            setLoading(true);
            setError(null);

            const updatedPanier = await panierService.removeProduct(productId);
            setPanier(updatedPanier);
        } catch (err) {
            setError(err?.message || "Erreur suppression produit");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // RESET AFTER CHECKOUT
    // --------------------------------------------------
    const resetPanier = () => {
        setPanier(null);
    };

    // --------------------------------------------------
    // INIT (WHEN TOKEN EXISTS)
    // --------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            loadPanier();
        } else {
            setLoading(false);
        }
    }, []);

    // --------------------------------------------------
    // COMPUTED VALUES
    // --------------------------------------------------
    const itemCount = panier?.items?.length || 0;

    const totalPrice =
        panier?.items?.reduce(
            (sum, item) => sum + Number(item.product?.price || 0),
            0
        ) || 0;

    const value = {
        panier,
        loading,
        error,
        loadPanier,
        addProduct,
        removeProduct,
        resetPanier,
        itemCount,
        totalPrice,
    };

    return (
        <PanierContext.Provider value={value}>
            {children}
        </PanierContext.Provider>
    );
};
