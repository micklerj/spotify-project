import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import ProfilePage from '../components/profilePage';
import Footer from '../components/footerButtons';

function Profile() {
  const { DBID } = useParams();


  return (    
    
    <div className="profile page">

      <ProfilePage DBID={DBID} />   

      <Footer />   
      
    </div>
    
  );
}

export default Profile;