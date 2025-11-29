import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductComparison = ({ usedProduct }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sécurité : si pas de usedProduct → NE PAS appeler l'API
    if (!usedProduct) {
      console.log("❌ Aucun usedProduct reçu !");
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/compare",
          { usedProduct }
        );

        console.log("✔ data:", response.data);

        setComparisonData(response.data);
      } catch (err) {
        console.error("❌ Erreur API :", err);
        setError("Erreur lors de la comparaison.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [usedProduct]);

  // 🔄 STATES UNIQUES – pas de return avant les hooks !!
  if (loading) {
    return <p className="text-gray-500">Chargement de la comparaison…</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!comparisonData) {
    return <p className="text-gray-500">Aucune donnée disponible.</p>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-3">Comparaison produit</h2>

      <p><strong>Prix estimé neuf :</strong> {comparisonData.newPriceEstimate || "Non disponible"}</p>

      <p className="mt-2">
        <strong>Conseil :</strong> {comparisonData.advice || "Aucun conseil disponible."}
      </p>
    </div>
  );
};

export default ProductComparison;
