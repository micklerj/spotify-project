import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        fetch('https://spotify-project-lhca.onrender.com/api/ensureAuth', {
            credentials: 'include', // Ensure cookies are included in the request
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.isAuthenticated && data.isAuthenticated === 'true') {
                    setIsAuthenticated(true);    
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch((error) => { 
                console.error('Error:', error); 
                setIsAuthenticated(false);
            });
    }, []);
    
    if (isAuthenticated === null) {
        return null; // or a loading spinner
    }
    
    return isAuthenticated ? children : <Navigate to="/" replace />;
    // return children;
};

export default ProtectedRoute; 