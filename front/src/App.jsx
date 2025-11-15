import { useState } from "react";
import { analyseProduit } from "./api";

function App() {
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState(null);

  const handleAnalyse = async () => {
    const data = await analyseProduit(title);
    setInfo(data);
  };

  return (
    <div>
      <h1>Analyse IA du produit 🧠</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du produit" />
      <button onClick={handleAnalyse}>Analyser</button>

      {info && (
        <div>
          <p>Prix neuf : {info.prixNeuf}</p>
          <p>Vendeur : {info.vendeur}</p>
          <a href={info.lien}>Lien vers produit</a>
        </div>
      )}
    </div>
  );
}

export default App;
