import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = 1 //TODO: logic to check if the user is authenticated
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute; 