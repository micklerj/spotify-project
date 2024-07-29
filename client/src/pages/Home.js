import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import Footer from '../components/footerButtons';
import ArtistSearch from '../components/artistSearch';
import ProfilePage from '../components/profilePage';

function Home() {
  const [backendData, setBackendData] = useState([{}]);

  // test communication with backend
  useEffect(() => {
    fetch('/api/example')
      .then(response => response.json())
      .then(data => setBackendData(data));
  }, []);

  return (    
    
    <div className="home page">

      <div>
        {(typeof backendData.message === 'undefined') ? (
          <p>Loading...</p>
        ) : (
          <p>{backendData.message}</p>
        )}
      </div>

      <ProfilePage />      

      <Footer />
      
    </div>
    
  );
}

export default Home;