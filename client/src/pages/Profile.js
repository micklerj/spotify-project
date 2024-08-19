import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import ProfilePage from '../components/profilePage';
import Footer from '../components/footerButtons';

function Profile() {
  const { userID } = useParams();


  return (    
    
    <div className="profile page">

      <ProfilePage displayedUserID={userID} />   

      <Footer />   
      
    </div>
    
  );
}

export default Profile;