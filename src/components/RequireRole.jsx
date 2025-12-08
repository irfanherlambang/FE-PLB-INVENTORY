import { Navigate } from "react-router-dom";

export default function RequireRole({ allowedRoles, componentForRole1, fallbackComponent }) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return <Navigate to="/login" replace />;

    const userRole = Number(user.role_id);

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    if (userRole === 1) return componentForRole1;

    return fallbackComponent;
}
