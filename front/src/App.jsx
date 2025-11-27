import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAd from "./pages/CreateAd";
import ListingDetail from "./pages/ListingDetail";
import ListingsList from "./pages/ListingList";

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
          <Route path="/listings/:id/compare" element={<ProductComparison />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
