import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAd from "./pages/CreateAd";
import ListingDetail from "./pages/ListingDetail";
import ListingsList from "./pages/ListingList";
import ComparePage from "./pages/ComparePage";


export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* Contenu principal */}
      <div style={{ minHeight: "100vh", paddingTop: "80px" }}>
        <Routes>
          <Route path="/shop" element={<ListingsList />} />
          <Route path="/" element={<CreateAd />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/compare/:id" element={<ComparePage />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}
