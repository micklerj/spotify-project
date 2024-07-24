import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import Header from '../components/header';

const CLIENT_ID = '9b655af69eb243c98069a6c4965afc16'
const CLIENT_SECRET = '15de6297eacb4dcb968f9930725f8bf5'

function Home() {
  const [artist, setArtist] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  const [backendData, setBackendData] = useState([{}]);
  useEffect(() => {
    fetch('/api/example')
      .then(response => response.json())
      .then(data => setBackendData(data));
  }, []);

  useEffect(() => { 
    // API access token
    var authParams = {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }
    fetch('https://accounts.spotify.com/api/token', authParams) 
      .then(response => response.json())
      .then(data => setAccessToken(data.access_token))
      .catch((error) => { console.error('Error:', error); });
  }, []);


  // search function
  async function searchArtist() {
    console.log('searching for ' + artist);

    // get request retrieving the artist ID
    var searchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', searchParams)
      .then(response => response.json())
      .then(data => { 
        console.log(data);
        return data.artists.items[0].id; 
      })

    // get all the albums by the artist
    var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParams)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlbums(data.items);
      }
    )

  }
  return (    
    
    <div className="home page">
      <Header />

      <div>
        {(typeof backendData.message === 'undefined') ? (
          <p>Loading...</p>
        ) : (
          <p>{backendData.message}</p>
        )}
      </div>

      <Container>
        <InputGroup className='mb-3' size='1g'>
          <FormControl
            placeholder='Search for artist'
            type='input'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchArtist();
              }
            }}
            onChange={(e) => setArtist(e.target.value)}
          />
          <Button 
            variant='primary' 
            id='button-addon2' 
            onClick={searchArtist}>
            Search
          </Button>
        </InputGroup>
      </Container>

      <Container>
        <Row className='mx-2 row row-cols-5'>
          {albums.map( (album, i) => {
            return (
              <Card>
                <Card.Img src={album.images[0].url}/>
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            )
          })}
          
        </Row>

      </Container>

    </div>
    
  );
}

export default Home;