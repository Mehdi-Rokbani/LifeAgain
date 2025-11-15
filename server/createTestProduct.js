import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import Category from './models/Category.js';
import Address from './models/Address.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestProducts() {
    try {
        await mongoose.connect(process.env.URL); // ← CORRIGÉ
        console.log("✅ MongoDB connecté");

        const userId = "690fc01ccbb891b31ec1df69";

        // 1️⃣ Vérifie que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ Utilisateur introuvable avec cet ID");
            return;
        }
        console.log("✅ Utilisateur trouvé:", user.username || user.email);

        // 2️⃣ Crée ou récupère des catégories
        const categories = [
            { name: "Vêtements", icon: "fa-tshirt" },
            { name: "Électronique", icon: "fa-laptop" },
            { name: "Meubles", icon: "fa-couch" },
        ];

        const createdCategories = [];
        for (const cat of categories) {
            let category = await Category.findOne({ name: cat.name });
            if (!category) {
                category = await Category.create(cat);
                console.log("✅ Catégorie créée:", category.name);
            } else {
                console.log("ℹ️  Catégorie existe déjà:", category.name);
            }
            createdCategories.push(category);
        }

        // 3️⃣ Crée ou récupère une adresse
        let address = await Address.findOne({ user: userId });
        if (!address) {
            address = await Address.create({
                user: userId,
                street: "Avenue Habib Bourguiba",
                city: "Tunis",
                postalCode: "1000",
                country: "Tunisia",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065] // [longitude, latitude] Tunis
                }
            });
            console.log("✅ Adresse créée");
        } else {
            console.log("ℹ️  Adresse existe déjà");
        }

        // 4️⃣ Crée des produits de test
        const products = [
            {
                title: "Veste en cuir vintage",
                description: "Belle veste en cuir noir, taille M, excellent état. Portée seulement quelques fois. Style biker classique.",
                price: 45.99,
                condition: "used",
                category: createdCategories[0]._id, // Vêtements
                seller: userId,
                address: address._id,
                status: "available",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065]
                }
            },
            {
                title: "iPhone 12 Pro 128GB",
                description: "iPhone 12 Pro 128GB, très bon état, avec boîte et accessoires d'origine. Batterie à 89%.",
                price: 599.99,
                condition: "used",
                category: createdCategories[1]._id, // Électronique
                seller: userId,
                address: address._id,
                status: "available",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065]
                }
            },
            {
                title: "Chaussures Nike Air Max",
                description: "Chaussures Nike Air Max pointure 42, comme neuves, portées seulement 2 fois. Couleur blanc/bleu.",
                price: 79.99,
                condition: "used",
                category: createdCategories[0]._id,
                seller: userId,
                address: address._id,
                status: "available",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065]
                }
            },
            {
                title: "Table basse en bois massif",
                description: "Jolie table basse en bois massif, dimensions 100x60cm. Parfait état, style scandinave.",
                price: 120.00,
                condition: "used",
                category: createdCategories[2]._id, // Meubles
                seller: userId,
                address: address._id,
                status: "available",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065]
                }
            },
            {
                title: "MacBook Air M1 2020",
                description: "MacBook Air M1 8GB RAM, 256GB SSD. Excellent état, très peu utilisé. Avec chargeur.",
                price: 799.99,
                condition: "used",
                category: createdCategories[1]._id,
                seller: userId,
                address: address._id,
                status: "available",
                location: {
                    type: "Point",
                    coordinates: [10.1815, 36.8065]
                }
            }
        ];

        console.log("\n📦 Création des produits...\n");
        const createdProducts = [];
        
        for (const prod of products) {
            try {
                const created = await Listing.create(prod);
                createdProducts.push(created);
                console.log(`✅ "${created.title}"`);
                console.log(`   💰 Prix: ${created.price} TND`);
                console.log(`   🆔 ID: ${created._id}\n`);
            } catch (err) {
                console.log(`❌ Erreur pour "${prod.title}":`, err.message);
            }
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`🎉 ${createdProducts.length} produits créés avec succès !`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        console.log("📋 IDs des produits créés :");
        createdProducts.forEach(p => {
            console.log(`   - ${p._id} : ${p.title}`);
        });

    } catch (error) {
        console.error("❌ Erreur:", error);
    } finally {
        mongoose.connection.close();
    }
}

createTestProducts();