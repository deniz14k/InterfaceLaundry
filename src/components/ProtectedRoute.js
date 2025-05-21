import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);

  // Not logged in?
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not in allowed list?
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Allowed!
  return children;
}
