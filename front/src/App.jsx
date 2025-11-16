import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import Signup from "./pages/register";
import Login from "./pages/Login";
import ProfileUpdate from "./pages/ProfileUpdate";
import VerifyEmail from "./pages/Verify";
//import OnboardingAddress from "./pages/OnboardingAddress";
//import OnboardingPicture from "./pages/OnboardingPicture";
import Onboarding from "./pages/Onboarding";
//import ProtectedRoute from "./components/ProtectedRoute"; // optional for later
//import Home from "./pages/Home"; // optional homepage
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileUpdate />} />
          <Route path="/verify" element={<VerifyEmail />} />
          
          <Route path="/onboarding" element={<Onboarding />} />




          {/* Example Home page (optional) */}
          {/* <Route path="/" element={<Home />} />*/}

          {/* Example protected route usage */}
          {/* 
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> 
          */}
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
