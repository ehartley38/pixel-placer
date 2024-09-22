import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ session }) => {
  const location = useLocation();

  if (!session || !session.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet context={{ session }} />;
};

export default ProtectedRoute;