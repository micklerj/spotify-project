import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/footerButtons';
import ArtistSearch from '../components/artistSearch';
import ProfilePage from '../components/profilePage';

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