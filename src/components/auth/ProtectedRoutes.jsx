import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../../utils/auth.js';

export function OperatorRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role === 'USER') {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <Outlet />;
}

export function AuthenticatedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function UserRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role !== 'USER') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
