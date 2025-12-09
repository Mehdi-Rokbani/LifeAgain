import Category from "../models/Category.js";

// -----------------------------------------------------
// CREATE CATEGORY
// -----------------------------------------------------
export const createCategory = async (req, res) => {
  try {
    const { name, image, parentCategory, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ error: "Category already exists" });

    let parent = null;
    if (parentCategory) {
      parent = await Category.findById(parentCategory);
      if (!parent) return res.status(404).json({ error: "Parent category not found" });
    }

    const category = await Category.create({
      name: name.trim(),
      image: image || "",   // ⬅️ NEW FIELD
      parentCategory: parent ? parent._id : null,
      isActive: isActive ?? true,
    });

    return res.status(201).json({ message: "Category created successfully", category });

  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Server error creating category" });
  }
};


// -----------------------------------------------------
// GET ALL CATEGORIES
// -----------------------------------------------------
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(categories);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Server error fetching categories" });
  }
};

// -----------------------------------------------------
// UPDATE CATEGORY
// -----------------------------------------------------
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, parentCategory, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (parentCategory && parentCategory === id) {
      return res.status(400).json({ error: "A category cannot be its own parent" });
    }

    if (name && name.trim() !== category.name) {
      const exists = await Category.findOne({ name: name.trim() });
      if (exists) return res.status(409).json({ error: "Category name already exists" });
    }

    let parent = null;
    if (parentCategory) {
      parent = await Category.findById(parentCategory);
      if (!parent) return res.status(404).json({ error: "Parent category not found" });
    }

    category.name = name ? name.trim() : category.name;
    category.image = image || category.image;   // ⬅️ NEW FIELD
    category.isActive = isActive ?? category.isActive;
    category.parentCategory = parent ? parent._id : null;

    await category.save();

    return res.status(200).json({ message: "Category updated successfully", category });

  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Server error updating category" });
  }
};

// -----------------------------------------------------
// DELETE CATEGORY (SAFE DELETE)
// -----------------------------------------------------
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Prevent deletion if subcategories exist
    const subs = await Category.find({ parentCategory: id });

    if (subs.length > 0) {
      return res.status(400).json({
        error: "Cannot delete a category that has subcategories",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      message: "Category deleted successfully",
      deletedId: id,
    });

  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Server error deleting category" });
  }
};

// -----------------------------------------------------
// GET SUBCATEGORIES OF A CATEGORY
// -----------------------------------------------------
export const getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    const subs = await Category.find({ parentCategory: id })
      .select("name icon isActive createdAt");

    return res.status(200).json(subs);

  } catch (err) {
    console.error("SUBCATEGORY FETCH ERROR:", err);
    return res.status(500).json({ error: "Server error fetching subcategories" });
  }
};

// -----------------------------------------------------
// CATEGORY TREE BUILDER (RECURSIVE)
// -----------------------------------------------------
const buildTree = (categories, parent = null) => {
  return categories
    .filter(cat => String(cat.parentCategory) === String(parent))
    .map(cat => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }));
};

// -----------------------------------------------------
// GET CATEGORY TREE
// -----------------------------------------------------
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find().lean(); // plain objects

    const tree = buildTree(categories, null);

    return res.status(200).json(tree);

  } catch (err) {
    console.error("CATEGORY TREE ERROR:", err);
    return res.status(500).json({ error: "Server error building tree" });
  }
};
