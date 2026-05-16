import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = localStorage.getItem("userToken");

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // اگر login نشده باشد یا token وجود نداشته باشد
  if (!user || !token || token === "null" || token === "undefined") {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname}`}
        replace
      />
    );
  }

  // اگر route مخصوص role خاص باشد، مثلاً admin
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;