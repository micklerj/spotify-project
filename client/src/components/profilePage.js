import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import privateIcon from '../assets/private.png';
import publicIcon from '../assets/public.png';
import './styles/profilePage.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';


function ProfilePage({DBID}) {
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
  const [displayGenres, setDisplayGenres] = useState([]);
  const [genreTimeFrame, setGenreTimeFrame] = useState('short_term');
  const [genreCount, setGenreCount] = useState(10);
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('');
  const [followerCount, setFollowerCount] = useState(null);
  const [userID, setUserID] = useState('');
  const [userIDDupe, setUserIDDupe] = useState('');     // for when the current userID is needed but another user is displayed
  const [displayedUserID, setDisplayedUserID] = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [otherUserIsDisplayed, setOtherUserIsDisplayed] = useState(null);
  const [otherUserIsFollowed, setOtherUserIsFollowed] = useState(null);
  const [wasOriginallyFollowed, setWasOriginallyFollowed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoseph, setIsJoseph] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPrivacyConfirmation, setShowPrivacyConfirmation] = useState(false);

  const navigate = useNavigate();


  // convert DBID to displayedUserID
  useEffect(() => {
    if (DBID) {
      fetch(`https://spotify-project-lhca.onrender.com/api/convertDBIDToUserID?DBID=${DBID}`)
        .then(response => response.json())
        .then(data => {
          setDisplayedUserID(data);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      setDisplayedUserID('');
    }
  }, []);

  // get profile pic, username, and userID    and   update DB if neccisary 
  useEffect(() => {
    if (displayedUserID === null) return;

    const fetchData = async () => {
      try {
        const response = await fetch('https://spotify-project-lhca.onrender.com/api/profileInfo', {
          credentials: 'include',   // Ensure cookies are included in the request
        });
        const data = await response.json();    
  
        if (data.id && (!displayedUserID || displayedUserID === data.id)) {  
          setOtherUserIsDisplayed(false);
          setWasOriginallyFollowed(false);  // doesn't matter, but need this line in order for loading to finish
          setUserID(data.id); 
          setProfilePic(data.images[1].url);
          setUserName(data.display_name);
          setFollowerCount(data.followers.total);

          // for personalized message
          if (data.id === '22o22cwit6gnvviwcfsc6l5pi') {   
            setIsJoseph(true);
          } 
  
          // update profile info in DB if necessary
          const putData = {
            "userID": data.id,
            "username": data.display_name,
            "profilePic": data.images[1].url,
            "followerCount": data.followers.total
          }  
          try {
            await axios.put('https://spotify-project-lhca.onrender.com/api/updateUser', putData);
          } catch (error) { 
            console.error('Error:', error);
          }
        }
        else if (displayedUserID) {
          // display user is not the logged in user, get profile from DB   and recently played and privacy
          setOtherUserIsDisplayed(true);
          try {
            const otherUserResponse = await fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${displayedUserID}`);
            const otherUserData = await otherUserResponse.json();
            if (otherUserData.message && otherUserData.message === 'User not found') {
              // unvalid userID  ,   nav to 404 page
              navigate('/noPage');
            }
            else {
              setUserIDDupe(data.id);
              setProfilePic(otherUserData.profilePic);
              setUserName(otherUserData.username);
              setRecentlyPlayed(otherUserData.recentlyPlayed);
              setPrivacy(otherUserData.privacy); 

              // for personalized message
              if (data === '22o22cwit6gnvviwcfsc6l5pi') {   
                setIsJoseph(true);
              }

            }                       
          } catch (error) {
            console.error('Error:', error);
          }

          // get follower count of other user
          axios.get(`https://spotify-project-lhca.onrender.com/api/getFollowerCount?id=${displayedUserID}`, { withCredentials: true })
            .then(response => {
              const data = response.data;
              setFollowerCount(data);
            })
            .catch((error) => { 
              console.error('Error:', error); 
            });

          // determine if other user is followed or not
          try {
            const currUserResponse = await fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${data.id}`);
            const currUserData = await currUserResponse.json();
            if (currUserData.following.includes(displayedUserID)) {
              setOtherUserIsFollowed(true);
              setWasOriginallyFollowed(true);
            }
            else {
              setOtherUserIsFollowed(false);
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
  }, [displayedUserID]);

  // get privacy setting  (of currently logged in user)
  useEffect(() => {    
    if (userID) {           // Make sure ID is not null
      fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${userID}`)
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
      fetch(`https://spotify-project-lhca.onrender.com/api/getRecentlyPlayed`, { credentials: 'include'})
        .then(response => response.json())
        .then(data => {
          const songNArtist = data.items[0].track.name + ' ~ ' + data.items[0].track.artists[0].name;
          setRecentlyPlayed(songNArtist);
          // update DB
          const putData = {
            "userID": userID,
            "recentlyPlayed": songNArtist
          }  
          axios.put('https://spotify-project-lhca.onrender.com/api/updateUser', putData)
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
      if (userID || userIDDupe) {
        await handleTopArtists('short_term', 10, true);
      }
    }
    helperFunction();
  }, [userID, userIDDupe]);
  
  // default = top songs over last month   and load info into database
  useEffect(() => {    
    const helperFunction = async () => {
      if (userID) {
        // only needed for logged in user
        await handleTopSongs('long_term', 10, true, false);
        await handleTopSongs('medium_term', 10, true, false);
      }
      if (userID || userIDDupe) {
        await handleTopSongs('short_term', 10, true);
      }
    }
    helperFunction(); 

  }, [userID, userIDDupe]);

  // default = top genres over last month  and load info into database
  useEffect(() => {
    const helperFunction = async () => {
      if (userID) {
        // only needed for logged in user
        await handleTopGenres('long_term', true, false);
        await handleTopGenres('medium_term', true, false);
      }
      if (userID || userIDDupe) {
        await handleTopGenres('short_term', true);
      }
    }
    helperFunction(); 
  }, [userID, userIDDupe]);

  // done loading
  useEffect(() => {
    if (otherUserIsDisplayed !== null && privacy !== null && wasOriginallyFollowed !== null) {
      setLoading(false);
    }
  }, [otherUserIsDisplayed, privacy, wasOriginallyFollowed]);

  // get top artists
  async function handleTopArtists(timeFrame, count, init = false, loadOnPage = true) {
    if (userID) {
      axios.get(`https://spotify-project-lhca.onrender.com/api/topArtists?timeFrame=${timeFrame}&count=${count}&init=${init}`, { withCredentials: true })
        .then(response => {
          const data = response.data;
          if (loadOnPage) {
            // console.log(data);
            setArtists(data.items.map(item => item.name));
            setArtistPics(data.items.map(item => item.images[0].url));
            setArtistURLs(data.items.map(item => item.external_urls.spotify));
          }
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else if (displayedUserID){

      // timeframe for database content
      var topArtistsTime = '';
      if      (timeFrame === 'short_term')  { topArtistsTime = 'topArtists1M'; }
      else if (timeFrame === 'medium_term') { topArtistsTime = 'topArtists6M'; }
      else                                  { topArtistsTime = 'topArtists1Y'; }

      fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${displayedUserID}`)
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
      fetch(`https://spotify-project-lhca.onrender.com/api/topSongs?timeFrame=${timeFrame}&count=${count}&init=${init}`, { credentials: 'include'})
        .then(response => response.json())
        .then(data => {
          if (loadOnPage) {
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
    else if (displayedUserID) {

      // timeframe for database content
      var topSongsTime = '';
      if      (timeFrame === 'short_term')  { topSongsTime = 'topSongs1M'; }
      else if (timeFrame === 'medium_term') { topSongsTime = 'topSongs6M'; }
      else                                  { topSongsTime = 'topSongs1Y'; }

      fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${displayedUserID}`)
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
  async function handleTopGenres(timeFrame, init = false, loadOnPage = true) { 
    if (userID) {
      // get all 50 top genres from api
      fetch(`https://spotify-project-lhca.onrender.com/api/topGenres?timeFrame=${timeFrame}&init=${init}`, { credentials: 'include'})
        .then(response => response.json())
        .then(data => {
          if (loadOnPage) {
            var newGenres = data.map(pair => pair[0]);
            setGenres(newGenres);
            setDisplayGenres(newGenres.slice(0, 10));
          }
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else if (displayedUserID) {
      // timeframe for database content
      var topGenresTime = '';
      if      (timeFrame === 'short_term')  { topGenresTime = 'topGenres1M'; }
      else if (timeFrame === 'medium_term') { topGenresTime = 'topGenres6M'; }
      else                                  { topGenresTime = 'topGenres1Y'; }

      fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${displayedUserID}`)
        .then(response => response.json())
        .then(data => {
          setGenres(data[topGenresTime]);
          setDisplayGenres(data[topGenresTime]);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
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
      setGenreCount(count);
      setDisplayGenres(genres.slice(0, count));
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

    axios.put('https://spotify-project-lhca.onrender.com/api/changePrivacy', putData)      
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
      axios.put('https://spotify-project-lhca.onrender.com/api/removeFromFollowing', putData)      
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
      axios.put('https://spotify-project-lhca.onrender.com/api/addToFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }

    // toggle follow with spotify api
    if (otherUserIsFollowed) {
      // unfollow
      fetch(`https://spotify-project-lhca.onrender.com/api/unfollow?id=${displayedUserID}`, { credentials: 'include'})
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // follow
      fetch(`https://spotify-project-lhca.onrender.com/api/follow?id=${displayedUserID}`, { credentials: 'include'})
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
      await axios.post('https://spotify-project-lhca.onrender.com/api/logout', { withCredentials: true });
  
      // Redirect the user to the login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }


  return (
    <div className='color-border'>      

      {(userID || userIDDupe) && (
        <div className="profile-container">
          <div className="profile-content">
            <img src={profilePic} alt="Profile Picture" className="profile-image" />
            <div className="profile-info">
              <h1 className="username">{userName}</h1>
              <div className="song">
                <DisplayRecentlyPlayed songTitle={recentlyPlayed} />
              </div>
              <div className='privacy-n-followers'>
                {(privacy === 'Public' || privacy === 'Private') && (
                  <img 
                    src={privacy === 'Public' ? publicIcon : privateIcon} 
                    className='privacy-icon'
                    onClick={otherUserIsDisplayed ? null : () => setShowPrivacyConfirmation(true)}
                    title={otherUserIsDisplayed ? "" :"Change privacy"}
                  />
                )}
                <div className='follower-count'>
                  {followerCount}
                  <span className='follower-count-text'>{'followers'}</span>
                </div>
              </div>
              { otherUserIsDisplayed && (privacy === 'Public' || wasOriginallyFollowed) && (otherUserIsFollowed !== null) && (             
                <button
                  className={`pro-button ${otherUserIsFollowed ? 'pro-unfollow-button' : 'pro-follow-button'}`}                    
                  onClick={() => {
                    if (privacy === 'Private' && otherUserIsFollowed) {
                      setShowConfirmation(true);   
                    } else {
                      handleToggleFollow();
                    }
                  }}
                >
                  {otherUserIsFollowed ? 'Unfollow' : 'Follow'}
                </button>
              )}
              { userID && (
                <div className='pro-info-placeholder'></div>
              )}
            </div>
            
          </div>   
          {isJoseph && (
            <div className='personalized-message-container'>
            Thanks for checking out my app! If you find it cool, or at least don't think it sucks, 
            please tell all your friends and family to check it out too. 
            I'm thankful for all of you and greatly appriciate the support! God bless.
            </div>  
          )}

          <div className="logout-button-container">
            {userID && (   
              <button onClick={handleLogout}>Logout</button>
            )}
          </div>
        </div>
      )}

      {showConfirmation && (
        <>
          <div className="pro-overlay" onClick={() => setShowConfirmation(false)}></div>

          <div className="pro-confirmation">
            <p>Are you sure you want to unfollow? This user is private and can't be re-followed.</p>
            <div className='pro-confirm-buttons'>
              <button 
                className="pro-confirm-button"
                onClick={() => {
                  handleToggleFollow();
                  setShowConfirmation(false);
                }}>
                Yes
              </button>
              <button 
                className="pro-confirm-button"
                onClick={() => setShowConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        </>
      )}

      {showPrivacyConfirmation && (
        <>
          <div className="pro-overlay" onClick={() => setShowPrivacyConfirmation(false)}></div>

          <div className="pro-confirmation">
            <p>change privacy?</p>
            <div className='pro-confirm-buttons'>
              <button 
                className="pro-confirm-button"
                onClick={() => {
                  handleChangePrivacy();
                  setShowPrivacyConfirmation(false);
                }}>
                Yes
              </button>
              <button 
                className="pro-confirm-button"
                onClick={() => setShowPrivacyConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        </>
      )}
      
      {loading ? (
        <div className="loading-container">Loading...</div>
        ) : (
        (!otherUserIsDisplayed || privacy === 'Public' || wasOriginallyFollowed) ? (

          <div className="body-container"> 

            <div className="top-items-container">
              <div className="items-header">
                Top Artists
                <div className="buttons-container">
                  <button 
                    className={`button time-frame-button ${artistTimeFrame === 'short_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopArtists('short_term', 10);
                      setArtistTimeFrame('short_term');
                      setArtistCount(10);
                    }}>
                    1M
                  </button>
                  <button 
                    className={`button time-frame-button ${artistTimeFrame === 'medium_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopArtists('medium_term', 10);
                      setArtistTimeFrame('medium_term');
                      setArtistCount(10);
                    }}>
                    6M
                  </button>
                  <button 
                    className={`button time-frame-button ${artistTimeFrame === 'long_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopArtists('long_term', 10);
                      setArtistTimeFrame('long_term');
                      setArtistCount(10);
                    }}>
                    1Y
                  </button>
                </div>
              </div>
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
              <div className="see-more-button">
                {!otherUserIsDisplayed && (artistCount < 50) && (
                  <button 
                    className="button"
                    onClick={() => handleSeeMore('artists', artistTimeFrame, artistCount)}>
                    ...
                  </button>
                )}
              </div>
            </div>

            <div className="top-items-container">
              <div className="items-header">
                Top Songs
                <div className="buttons-container">
                  <button 
                    className={`button time-frame-button ${songTimeFrame === 'short_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopSongs('short_term', 10);
                      setSongTimeFrame('short_term');
                      setSongCount(10);
                    }}>
                    1M
                  </button>
                  <button 
                    className={`button time-frame-button ${songTimeFrame === 'medium_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopSongs('medium_term', 10);
                      setSongTimeFrame('medium_term');
                      setSongCount(10);
                    }}>
                    6M
                  </button>
                  <button 
                    className={`button time-frame-button ${songTimeFrame === 'long_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopSongs('long_term', 10);
                      setSongTimeFrame('long_term');
                      setSongCount(10);
                    }}>
                    1Y
                  </button>
                </div>
              </div>
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
              <div className="see-more-button">
                {!otherUserIsDisplayed && (songCount < 50) && (
                  <button 
                    className='button'
                    onClick={() => handleSeeMore('songs', songTimeFrame, songCount)}>
                    ...
                  </button>
                )}
              </div>
            </div>

            <div className="top-items-container">
              <div className="items-header">
                Top Genres
                <div className="buttons-container">
                  <button 
                    className={`button time-frame-button ${genreTimeFrame === 'short_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopGenres('short_term');
                      setGenreTimeFrame('short_term');
                      setGenreCount(10);
                    }}>
                    1M
                  </button>
                  <button 
                    className={`button time-frame-button ${genreTimeFrame === 'medium_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopGenres('medium_term');
                      setGenreTimeFrame('medium_term');
                      setGenreCount(10);
                    }}>
                    6M
                  </button>
                  <button 
                    className={`button time-frame-button ${genreTimeFrame === 'long_term' ? 'active-button' : ''}`}
                    onClick={() => {
                      handleTopGenres('long_term');
                      setGenreTimeFrame('long_term');
                      setGenreCount(10);
                    }}>
                    1Y
                  </button>
                </div>
              </div>
              <ol className="genre-list">
                {displayGenres.map((genre, index) => (
                  <li key={index} className="genre-item">
                    <div className="genre-item-content">
                      <div className="genre-item-index">{index + 1}</div>
                      <a className="genre-item-link"href={`https://open.spotify.com/search/${genre}`}>{genre}</a>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="see-more-button">
                {!otherUserIsDisplayed && (genreCount < 50) && (
                  <button 
                    className='button'
                    onClick={() => handleSeeMore('genres', genreTimeFrame, genreCount)}>
                    ...
                  </button>
                )}
              </div>
            </div>

          </div>  ) : (
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
