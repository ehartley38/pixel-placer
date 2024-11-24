import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../context/sessionProvider";

const ProtectedRoute = () => {
  const location = useLocation();
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="h-screen w-screen fixed flex items-center justify-center">
        <div className="text-2xl font-semibold text-black">Loading...</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet context={{ session }} />;
};

export default ProtectedRoute;
