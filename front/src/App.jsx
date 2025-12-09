import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/chat";
import Home from "./pages/Home";
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
export default function App() {
    const { storedUser } = useContext(AuthContext);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                {storedUser && (<Route path="/profile" element={<Profile />} />)}
                {!storedUser && (<Route path="/profile" element={<Login />} />)}
                {storedUser && (<Route path="/chat" element={<Chat />} />)}
                {!storedUser && (<Route path="/chat" element={<Login />} />)}

            </Routes>
        </Router>
    );
}


