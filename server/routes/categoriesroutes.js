import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getCategoryTree
} from "../controllers/CategoriesController.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/tree", getCategoryTree);
router.get("/:id/subcategories", getSubcategories);

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
