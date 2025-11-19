import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import dotenv from 'dotenv';

dotenv.config();

const productImages = {
    "Veste en cuir vintage": [
        "http://localhost:5000/assets/veste-cuir.jpg"
    ],
    "iPhone 12 Pro 128GB": [
        "http://localhost:5000/assets/iPhone-12.jpg"
    ],
    "Chaussures Nike Air Max": [
        "http://localhost:5000/assets/nike-air-max.webp"
    ],
    "Table basse en bois massif": [
        "http://localhost:5000/assets/table-basse.jpg"
    ],
    "MacBook Air M1 2020": [
        "http://localhost:5000/assets/mac.webp"
    ]
};

async function addImages() {
    try {
        await mongoose.connect(process.env.URL);
        console.log("✅ MongoDB connecté");

        const products = await Listing.find();
        
        console.log(`📦 ${products.length} produits trouvés\n`);

        for (const product of products) {
            const images = productImages[product.title];
            
            if (images) {
                console.log(`🔄 Mise à jour de: ${product.title}`);
                console.log(`   Anciennes images:`, product.images);
                
                // FORCE la mise à jour
                product.images = images;
                product.markModified('images'); // ← Force Mongoose à voir le changement
                await product.save();
                
                console.log(`   Nouvelles images:`, product.images);
                console.log(`✅ Images ajoutées\n`);
            } else {
                console.log(`⚠️  Pas d'image pour: ${product.title}\n`);
            }
        }

        console.log("🎉 Toutes les images ont été ajoutées !");

    } catch (error) {
        console.error("❌ Erreur:", error);
    } finally {
        mongoose.connection.close();
    }
}

addImages();