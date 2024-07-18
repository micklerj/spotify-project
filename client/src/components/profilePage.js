import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';


const CLIENT_ID     = '9b655af69eb243c98069a6c4965afc16'
const CLIENT_SECRET = '15de6297eacb4dcb968f9930725f8bf5'

function ProfilePage() {
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [albugenresms, setGenres] = useState([]);
  const [profilePic, setProfilePic] = useState('');

  useEffect(() => {
    fetch('/api/profilePic')
      .then(response => response.json())
      .then(data => {
        console.log(data.pic);
        setProfilePic(data.pic);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }, []);

  
  async function getTopArtists() {
    fetch('/api/topArtists')
      .then(response => response.json())
      .then(data => {
        console.log(data.display_name);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <img src={profilePic} alt="Profile Picture" className="rounded-circle mr-2" style={{ width: "40px", height: "40px" }} />
        <Navbar.Brand href="#home" className="mr-auto">My Profile</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Option 1</Nav.Link>
            <Nav.Link href="#link">Option 2</Nav.Link>
            <Nav.Link href="#link">Option 3</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container>

        <Row className="justify-content-center mt-4">
          <Button variant="primary" className="mr-2" onClick={getTopArtists}>Button 1</Button>
          <Button variant="secondary">Button 2</Button>
        </Row>

        <Row className="justify-content-center mt-4">
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <Card.Title>List of Items</Card.Title>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
                <li>Item 4</li>
                <li>Item 5</li>
                <li>Item 6</li>
                <li>Item 7</li>
                <li>Item 8</li>
                <li>Item 9</li>
                <li>Item 10</li>
              </ul>
            </Card.Body>
          </Card>
        </Row>
      </Container>
    </div>
  );
}


export default ProfilePage;
