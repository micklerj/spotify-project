import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import privateIcon from '../assets/private.png';
import publicIcon from '../assets/public.png';
import followingCheck from '../assets/followingCheck.png';
import addFollowerIcon from '../assets/addFollowerIcon.png';
import './styles/profilePage.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';


function ProfilePage({displayedUserID}) {
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
  const [userID, setUserID] = useState('');
  const [userIDDupe, setUserIDDupe] = useState('');     // for when the current userID is needed but another user is displayed
  const [privacy, setPrivacy] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [otherUserIsDisplayed, setOtherUserIsDisplayed] = useState(null);
  const [otherUserIsFollowed, setOtherUserIsFollowed] = useState(false);
  const [wasOriginallyFollowed, setWasOriginallyFollowed] = useState(null);
  const [loading, setLoading] = useState(true);

  // get profile pic, username, and userID    and   update DB if neccisary 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/profileInfo');
        const data = await response.json();    
  
        if (displayedUserID === undefined || displayedUserID === data.id) {  
          setOtherUserIsDisplayed(false);
          setWasOriginallyFollowed(false);  // doesn't matter, but need this line in order for loading to finish
          setUserID(data.id); 
          setProfilePic(data.images[1].url);
          setUserName(data.display_name);
          console.log(data);
  
          // update profile info in DB if necessary
          const putData = {
            "userID": data.id,
            "username": data.display_name,
            "profilePic": data.images[1].url,
          }  
          try {
            await axios.put('http://localhost:3500/api/updateUser', putData);
          } catch (error) { 
            console.error('Error:', error);
          }
        }
        else {
          setUserIDDupe(data.id);
          // display user is not the logged in user, get profile from DB   and recently played and privacy
          setOtherUserIsDisplayed(true);
          try {
            const otherUserResponse = await fetch(`/api/getUser?userID=${displayedUserID}`);
            const otherUserData = await otherUserResponse.json();
            setProfilePic(otherUserData.profilePic);
            setUserName(otherUserData.username);
            setRecentlyPlayed(otherUserData.recentlyPlayed);
            setPrivacy(otherUserData.privacy);            
          } catch (error) {
            console.error('Error:', error);
          }

          // determine if other user is followed or not
          try {
            const currUserResponse = await fetch(`/api/getUser?userID=${data.id}`);
            const currUserData = await currUserResponse.json();
            if (currUserData.following.includes(displayedUserID)) {
              setOtherUserIsFollowed(true);
              setWasOriginallyFollowed(true);
            }
            else {
              setWasOriginallyFollowed(false);
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }
      } catch (error) { 
        console.error('Error:', error); 
      }
    }
  
    fetchData();
  }, []);

  // get privacy setting  (of currently logged in user)
  useEffect(() => {    
    if (userID) {           // Make sure ID is not null
      fetch(`/api/getUser?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
          setPrivacy(data.privacy);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }, [userID]);

  // get recently played song  (of currently logged in user)
  useEffect(() => {
    if (userID) {
      fetch(`/api/getRecentlyPlayed`)
        .then(response => response.json())
        .then(data => {
          const songNArtist = data.items[0].track.name + ' ~ ' + data.items[0].track.artists[0].name;
          setRecentlyPlayed(songNArtist);
          console.log("recent songs: ", data);
          // update DB
          const putData = {
            "userID": userID,
            "recentlyPlayed": songNArtist
          }  
          axios.put('http://localhost:3500/api/updateUser', putData)
            .catch((error) => { 
              console.error('Error:', error);
            })
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }, [userID]);

  // default = top artists over last month   and load info into database
  useEffect(() => {    
    const helperFunction = async () => {
      if (userID) {
        await handleTopArtists('long_term', 10, true, false);
        await handleTopArtists('medium_term', 10, true, false);
      }
      await handleTopArtists('short_term', 10, true);
    }
    helperFunction();
  }, [userID, otherUserIsDisplayed]);
  
  // default = top songs over last month   and load info into database
  useEffect(() => {    
    const helperFunction = async () => {
      if (userID) {
        // only needed for logged in user
        await handleTopSongs('long_term', 10, true, false);
        await handleTopSongs('medium_term', 10, true, false);
      }
      await handleTopSongs('short_term', 10, true);
    }
    helperFunction(); 

  }, [userID, otherUserIsDisplayed]);

  // default = top genres over last month  and load info into database
  useEffect(() => {
    handleTopGenres('short_term', 10, true);
  }, [userID, otherUserIsDisplayed]);

  // done loading
  useEffect(() => {
    if (otherUserIsDisplayed !== null && privacy !== null && wasOriginallyFollowed !== null) {
      setLoading(false);
    }
  }, [otherUserIsDisplayed, privacy, wasOriginallyFollowed]);

  // get top artists
  async function handleTopArtists(timeFrame, count, init = false, loadOnPage = true) {
    if (userID) {
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
    else {

      // timeframe for database content
      var topArtistsTime = '';
      if      (timeFrame === 'short_term')  { topArtistsTime = 'topArtists1M'; }
      else if (timeFrame === 'medium_term') { topArtistsTime = 'topArtists6M'; }
      else                                  { topArtistsTime = 'topArtists1Y'; }

      fetch(`/api/getUser?userID=${displayedUserID}`)
        .then(response => response.json())
        .then(data => {
          setArtists(data[topArtistsTime].map(artist => artist.artistName));
          setArtistPics(data[topArtistsTime].map(artist => artist.image));
          setArtistURLs(data[topArtistsTime].map(artist => artist.url));
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }

  // get top songs
  async function handleTopSongs(timeFrame, count, init = false, loadOnPage = true) {
    if (userID) {
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
    else {

      // timeframe for database content
      var topSongsTime = '';
      if      (timeFrame === 'short_term')  { topSongsTime = 'topSongs1M'; }
      else if (timeFrame === 'medium_term') { topSongsTime = 'topSongs6M'; }
      else                                  { topSongsTime = 'topSongs1Y'; }

      fetch(`/api/getUser?userID=${displayedUserID}`)
        .then(response => response.json())
        .then(data => {
          setSongs(data[topSongsTime].map(song => song.songName));
          setSongPics(data[topSongsTime].map(song => song.image));
          setSongSingers(data[topSongsTime].map(song => song.artistName));
          setSongURLs(data[topSongsTime].map(song => song.url));
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
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
      "userID": userID,
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

  // follow or unfollow the other user displayed
  async function handleToggleFollow() {

    // remove or add to DB
    if (otherUserIsFollowed) {
      // remove 
      const putData = {
        "userID": userIDDupe,       // current user
        "remove": displayedUserID   // followed user
      };
      axios.put('/api/removeFromFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // add
      const putData = {
        "userID": userIDDupe,       // current user
        "follow": displayedUserID   // followed user
      };
      axios.put('/api/addToFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }

    // toggle follow with spotify api
    if (otherUserIsFollowed) {
      // unfollow
      fetch(`/api/unfollow?id=${displayedUserID}`)
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // follow
      fetch(`/api/follow?id=${displayedUserID}`)
        .catch((error) => { 
          console.error('Error:', error);
        });
    }

    // update otherUserIsFollowed
    setOtherUserIsFollowed(!otherUserIsFollowed);
  }

  // logout by deleting current session
  async function handleLogout() {
    try {
      // Send a POST request to your server to invalidate the session
      await axios.post('/api/logout');
  
      // Redirect the user to the login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div>
      <div className="logout-button-container">
        {!otherUserIsDisplayed && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
      <Row bg="light" expand="lg" className="d-flex align-items-center">
      <div className="profile-container">
        <img src={profilePic} alt="Profile Picture" className="rounded-circle mr-2 profile-image" />
        <div className="profile-info">
          <h1>{userName}</h1>
          <div>
            <DisplayRecentlyPlayed songTitle={recentlyPlayed} />
          </div>
        </div>
        <div className="image-container align-right">
          {(privacy === 'Public' || privacy === 'Private') && !otherUserIsDisplayed && (
            <img 
              src={privacy === 'Public' ? publicIcon : privateIcon} 
              alt="privacy image" 
              onClick={handleChangePrivacy}
              title="Change privacy"
            />
          )}
          { otherUserIsDisplayed && (privacy === 'Public' || (privacy === 'Private' && otherUserIsFollowed) || wasOriginallyFollowed) && (
            <img 
              src={otherUserIsFollowed ? followingCheck : addFollowerIcon} 
              alt="(un)follow image" 
              onClick={handleToggleFollow}
              title={otherUserIsFollowed ? 'unfollow' : 'follow'}
              />
          )}
        </div>
      </div>
      </Row>
      
      {loading ? (
        <div className="loading-container">Loading...</div>
        ) : (
        (!otherUserIsDisplayed || privacy === 'Public' || wasOriginallyFollowed) ? (

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
                  <ol className="artist-list">
                    {artists.map((artist, index) => (
                      <li key={index} className="artist-item">
                        <div className="artist-item-index">{index + 1}</div>
                        <div className="artist-item-content">
                          <img src={artistPics[index]} alt={artist} className="artist-item-image" />
                          <a href={artistURLs[index]} className="artist-item-link">{artist}</a>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="d-flex justify-content-end">
                    {!otherUserIsDisplayed && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleSeeMore('artists', artistTimeFrame, artistCount)}>
                        ...
                      </Button>
                    )}
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
                  <ol className="song-list">
                    {songs.map((song, index) => (
                      <li key={index} className="song-item">
                        <div className="song-item-content">
                          <div className="song-item-index">{index + 1}</div>
                          <div className="song-item-info">
                            <a href={songURLs[index]} className="song-item-link">{song}</a>
                            <div>{songSingers[index]}</div>
                          </div>
                        </div>
                        <img src={songPics[index]} className="song-item-image" />
                      </li>
                    ))}
                  </ol>
                  <div className="d-flex justify-content-end">
                    {!otherUserIsDisplayed && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleSeeMore('songs', songTimeFrame, songCount)}>
                        ...
                      </Button>
                    )}
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

          </Container>  ) : (
          <div className="private-user-container">
            <img src={privateIcon} alt="Lock" />
            <p>This account is private</p>
          </div>
        )
      )}

      
    </div>
  );
}


export default ProfilePage;
