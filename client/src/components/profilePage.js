import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import axios from 'axios';



function ProfilePage() {
  const [artists, setArtists] = useState([]);
  const [artistURLs, setArtistURLs] = useState([]);
  const [artistPics, setArtistPics] = useState([]);
  const [artistTimeFrame, setArtistTimeFrame] = useState('short_term');
  const [artistCount, setArtistCount] = useState(10);
  const [songs, setSongs] = useState([]);
  const [songURLs, setSongURLs] = useState([]);
  const [songPics, setSongPics] = useState([]);
  const [songSingers, setSongSingers] = useState([]);
  const [songTimeFrame, setSongTimeFrame] = useState('short_term');
  const [songCount, setSongCount] = useState(10);
  const [genres, setGenres] = useState([]);
  const [GenreTimeFrame, setGenreTimeFrame] = useState('short_term');
  const [genreCount, setGenreCount] = useState(10);
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('');
  const [ID, setID] = useState('');
  const [privacy, setPrivacy] = useState('');

  // get profile pic, username, and ID
  useEffect(() => {
    fetch('/api/profileInfo')
      .then(response => response.json())
      .then(data => {
        setProfilePic(data.images[1].url);
        setUserName(data.display_name);
        setID(data.id);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }, []);

  // get privacy setting
  useEffect(() => {
    if (ID) {               // Make sure ID is not null
      fetch(`/api/getUser?ID=${ID}`)
        .then(response => response.json())
        .then(data => {
          setPrivacy(data.privacy);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }, [ID]);

  // default = top artists over last month   and load info into database
  useEffect(() => {
    const helperFunction = async () => {
      await handleTopArtists('long_term', 10, true, false);
      await handleTopArtists('medium_term', 10, true, false);
      await handleTopArtists('short_term', 10, true);
    }
    helperFunction();
  }, []);
  
  // default = top songs over last month   and load info into database
  useEffect(() => {
    const helperFunction = async () => {
      await handleTopSongs('long_term', 10, true, false);
      await handleTopSongs('medium_term', 10, true, false);
      await handleTopSongs('short_term', 10, true);
    }
    helperFunction();
  }, []);

  // default = top genres over last month  and load info into database
  useEffect(() => {
    handleTopGenres('short_term', 10, true);
  }, []);

  // get top artists
  async function handleTopArtists(timeFrame, count, init = false, loadOnPage = true) {
    fetch(`/api/topArtists?timeFrame=${timeFrame}&count=${count}&init=${init}`)
      .then(response => response.json())
      .then(data => {
        if (loadOnPage) {
          console.log(data);
          setArtists(data.items.map(item => item.name));
          setArtistPics(data.items.map(item => item.images[0].url));
          setArtistURLs(data.items.map(item => item.external_urls.spotify));
        }
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  // get top songs
  async function handleTopSongs(timeFrame, count, init = false, loadOnPage = true) {
    fetch(`/api/topSongs?timeFrame=${timeFrame}&count=${count}&init=${init}`)
      .then(response => response.json())
      .then(data => {
        if (loadOnPage) {
          console.log(data);
          setSongs(data.items.map(item => item.name));
          setSongPics(data.items.map(item => item.album.images[0].url));
          setSongSingers(data.items.map(item => item.artists[0].name));
          setSongURLs(data.items.map(item => item.external_urls.spotify));
        }
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  // get top genres
  async function handleTopGenres(timeFrame, count, init = false, loadOnPage = true) {
    fetch(`/api/topGenres?timeFrame=${timeFrame}&count=${count}&init=${init}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setGenres(data.items.map(item => item.name));
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  // load more items to show
  async function handleSeeMore(type, timeFrame, count) {
    if (count < 50) {
      count += 10;
    }

    if (type === 'artists') {
      handleTopArtists(timeFrame, count);
      setArtistCount(count);
    }
    else if (type === 'songs') {
      handleTopSongs(timeFrame, count);
      setSongCount(count);
    }
    else if (type === 'genres') {
      handleTopGenres(timeFrame, count);
      setGenreCount(count);
    }
  }

  // change privacy setting
  async function handleChangePrivacy() {
    const putData = {
      "userID": ID,
      "privacy": privacy === 'Public' ? 'Private' : 'Public'
    };

    if (privacy === 'Public') {
      setPrivacy('Private');
    } else {
      setPrivacy('Public');
    }

    axios.put('/api/changePrivacy', putData)      
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  return (
    <div>
      <Row bg="light" expand="lg" className="d-flex align-items-center">
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '50px' }}>
          <img src={profilePic} alt="Profile Picture" className="rounded-circle mr-2" style={{ width: "200px" }} />
          <h1 style={{ marginLeft: '20px' }}>{userName}</h1>
          <h2 style={{ marginLeft: '20px' }}>{privacy}</h2>
          <Button variant="secondary" style={{ marginLeft: '20px' }} onClick={handleChangePrivacy}>Change Privacy</Button>
        </div>
      </Row>

      <Container>

        <Row className="justify-content-center mt-4">
          <Card style={{ width: "400px" }}>
            <Card.Body>
            <Card.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Top Artists
              <div style={{ display: 'flex' }}>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopArtists('short_term', 10);
                    setArtistTimeFrame('short_term');
                    setArtistCount(10);
                  }}>
                  1M
                </Button>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopArtists('medium_term', 10);
                    setArtistTimeFrame('medium_term');
                    setArtistCount(10);
                  }}>
                  6M
                </Button>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopArtists('long_term', 10);
                    setArtistTimeFrame('long_term');
                    setArtistCount(10);
                  }}>
                  1Y
                </Button>
              </div>
            </Card.Title>
              <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                {artists.map((artist, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '10px' }}>{index + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={artistPics[index]} alt={artist} style={{ width: '50px', marginRight: '10px', borderRadius: '50%' }} />
                      <a href={artistURLs[index]} style={{ color: 'black', textDecoration: 'none'}}>{artist}</a>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleSeeMore('artists', artistTimeFrame, artistCount)}>
                  ...
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Row>
        <Row className="justify-content-center mt-4">
          <Card style={{ width: "400px" }}>
            <Card.Body>
            <Card.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Top Songs
              <div style={{ display: 'flex' }}>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopSongs('short_term', 10);
                    setSongTimeFrame('short_term');
                    setSongCount(10);
                  }}>
                  1M
                </Button>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopSongs('medium_term', 10);
                    setSongTimeFrame('medium_term');
                    setSongCount(10);
                  }}>
                  6M
                </Button>
                <Button 
                  variant="secondary" 
                  style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    handleTopSongs('long_term', 10);
                    setSongTimeFrame('long_term');
                    setSongCount(10);
                  }}>
                  1Y
                </Button>
              </div>
            </Card.Title>
              <ol style={{ listStyleType: 'none' }}>
                {songs.map((song, index) => (
                  <li key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>{index + 1}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginLeft: '10px' }}>
                          <a href={songURLs[index]} style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }}>{song}</a>
                          <div>{songSingers[index]}</div>
                        </div>
                      </div>
                      <img src={songPics[index]} style={{ width: '50px', marginRight: '10px' }} />
                    </div>
                  </li>
                ))}
              </ol>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleSeeMore('songs', songTimeFrame, songCount)}>
                  ...
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Row>
        <Row className="justify-content-center mt-4 mb-4">
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <Card.Title>Top Genres</Card.Title>
              <ol>
                {genres.map((genre, index) => (
                  <li key={index}>{genre}</li>
                ))}
              </ol>
            </Card.Body>
          </Card>
        </Row>

      </Container>

      
    </div>
  );
}


export default ProfilePage;
