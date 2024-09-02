import React, { createContext, useState, useEffect } from 'react';

export const ProfilePicContext = createContext();

export const ProfilePicProvider = ({ children }) => {
  const [profilePic, setProfilePic] = useState('');

  useEffect(() => {
    async function fetchProfileInfo() {
      try {
        const response = await fetch('http://localhost:3500/api/profileInfo', {
          credentials: 'include', 
        });
        const data = await response.json();
        setProfilePic(data.images[1].url);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchProfileInfo();
  }, []);

  return (
    <ProfilePicContext.Provider value={profilePic}>
      {children}
    </ProfilePicContext.Provider>
  );
};