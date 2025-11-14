
import Category from "../models/Category.js";

// ➕ Créer une catégorie
export const createCategory = async (req, res) => {
  try {
    const { name, icon,parentCategory,isActive} = req.body;

    const newCategory = new Category({
      // kenet fama descption hna
       /*name,
      icon,             // ✅ ajouté
      parentCategory,   // ✅ ajouté
      isActive */
      
      name: name ? name.trim() : "Sans nom",   
      icon: icon ? icon.trim() : "",  
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newCategory.save();
    res.status(201).json({ message: "Catégorie ajoutée avec succès", category: newCategory });
  } catch (error) {
    console.error("Erreur ajout catégorie :", error);
    res.status(500).json({ error: "Erreur lors de la création de la catégorie" });
  }
};

// 📜 Récupérer toutes les catégories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur récupération catégories :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des catégories" });
  }
};
/*export const createCategory = async (req, res) => {
  try {
    console.log("📦 req.body:", req.body);
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json({ message: "Catégorie ajoutée avec succès", category: newCategory });
  } catch (error) {
    console.error("Erreur ajout catégorie :", error);
    res.status(500).json({ error: "Erreur lors de la création de la catégorie" });
  }
};*//*
export const createCategory = async (req, res) => {
  try {
    console.log("📦 req.body brut :", req.body);
    console.log("📦 type icon :", typeof req.body.icon, "valeur:", req.body.icon);

    const newCategory = new Category(req.body);
    await newCategory.save();

    console.log("📝 newCategory saved :", newCategory);

    res.status(201).json({ message: "Catégorie ajoutée avec succès", category: newCategory });
  } catch (error) {
    console.error("Erreur ajout catégorie :", error);
    res.status(500).json({ error: "Erreur lors de la création de la catégorie" });
  }
};
*/
