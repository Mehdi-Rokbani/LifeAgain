import mongoose from "mongoose";
import Category from "./models/Category.js"; // chemin vers ton modèle

await mongoose.connect("mongodb://localhost:27017/tonDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testCategory = new Category({
  name: "Test Four",
  icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
  isActive: true
});

await testCategory.save();

console.log("✅ Catégorie sauvegardée :", testCategory);

await mongoose.disconnect();
