import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { PanierProvider } from "./context/PanierContext.jsx";
import { FavoriteProvider } from "./context/FavoriteContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <PanierProvider>
          <FavoriteProvider>
            <App />
          </FavoriteProvider>
        </PanierProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
