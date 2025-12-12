import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useContext(AuthContext);

    // not logged in → redirect to login
    if (!user) return <Navigate to="/login" replace />;

    // logged in but wrong role → redirect home
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
