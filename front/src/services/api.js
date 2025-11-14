import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api", // adapte selon ton backend
});

// Récupérer tous les produits avec filtres
export const getProducts = async (filters = {}) => {
  const res = await API.get("/products", { params: filters });
  return res.data;
};

// Récupérer toutes les catégories
export const getCategories = async () => {
  const res = await API.get("/categories");
  // some backends wrap the array in an object (e.g. { value: [...], Count: n })
  // normalize to always return an array of categories
  if (res && res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.value)) return res.data.value;
    // fallback: if data contains a property with array, try to return it
    const arr = Object.values(res.data).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
};

// Récupérer les données pour la page d'accueil (bannières, featured, etc.)
export const getHome = async () => {
  const res = await API.get("/home");
  return res.data;
};

// Récupérer un produit par ID
export const getProductById = async (id) => {
  const res = await API.get(`/products/${id}`);
  return res.data;
};


