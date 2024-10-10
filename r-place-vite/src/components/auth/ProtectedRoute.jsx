import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../context/sessionProvider";

const ProtectedRoute = () => {
  const location = useLocation();
  const { session } = useSession();

  if (!session || !session.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet context={{ session }} />;
};

export default ProtectedRoute;
