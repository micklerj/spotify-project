import React, {useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        console.log('protected route entered');
        fetch(`/api/ensureAuth`)
            .then(response => response.json())
            .then(data => {
                console.log('callback from ensureAuth');
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
    console.log(isAuthenticated);
    
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute; 