import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PanierProvider } from './context/PanierContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import './App.css';

function App() {
  return (
    <Router>
      <PanierProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Shop />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </PanierProvider>
    </Router>
  );
}

export default App;