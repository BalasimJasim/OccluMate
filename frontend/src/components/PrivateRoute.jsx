import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/authContext';

const PrivateRoute = () => {
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!localStorage.getItem('token');
  
  console.log('PrivateRoute - User:', user); // Debug log
  console.log('PrivateRoute - IsAuthenticated:', isAuthenticated); // Debug log

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
