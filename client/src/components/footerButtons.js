import React, {useState, useEffect, useContext} from 'react';
import { useLocation } from 'react-router-dom';
import './styles/footerButtons.css';
import following from '../assets/following.png';
import followingThick from '../assets/following-thick.png';
import explore from '../assets/explore.png';
import exploreThick from '../assets/explore-thick.png';
import { ProfilePicContext } from '../contexts/ProfilePicContext';


function Footer() {
  const profilePic = useContext(ProfilePicContext);
  const [userID, setUserID] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  const location = useLocation();
  const isProfile = location.pathname === '/profile' || location.pathname === '/profile/' || /^\/profile\/\S+\/?$/.test(location.pathname);  
  const isFollowing = location.pathname === '/following'|| location.pathname === '/following/';
  const isExplore = location.pathname === '/explore' || location.pathname === '/explore/';

  // get userID
  useEffect(() => {
    async function fetchProfileInfo() {
      try {
        const response = await fetch('https://spotify-project-lhca.onrender.com/api/profileInfo', {
          credentials: 'include', // Ensure cookies are included in the request
        });
        const data = await response.json();
        setUserID(data.id);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchProfileInfo();
  }, []);

  // check if userID in the pathname is the current userID
  useEffect(() => {
    if (userID && isProfile) {
      const pathID = location.pathname.split('/')[2];
      if (pathID === userID || pathID === '' || pathID === undefined) {
        setIsLoggedInUser(true);
      }
    }
  }, [userID, isProfile, location.pathname]);

  // set loading to false when profilePic is loaded
  useEffect(() => {
    if (profilePic) {
      setLoading(false); 
    }
    else {
      setLoading(true);
    }
  }, [profilePic]);

  return (
    <div className="footer">
      {!loading && (  
        <div className="navbar">
          <div className="nav-item">
            <a href="/profile" className="nav-link" onClick={(event) => {if(isLoggedInUser) event.preventDefault();}}>
            <img src={profilePic} alt="Profile" className={`profile-button footer-button ${isLoggedInUser ? 'active-footer-button' : ''}`}/>
            </a>
          </div>
          <div className="nav-item">
            <a href="/following" className="nav-link" onClick={(event) => {if(isFollowing) event.preventDefault();}}>
              <img src={isFollowing ? followingThick : following} alt="Following" className={`following-button footer-button ${isFollowing ? 'active-footer-button' : ''}`}/>
            </a>
          </div>
          <div className="nav-item">
            <a href="/explore" className="nav-link" onClick={(event) => {if(isExplore) event.preventDefault();}}>
            <img src={isExplore ? exploreThick : explore} alt="explore" className={`explore-button footer-button ${isExplore ? 'active-footer-button' : ''}`}/>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


export default Footer;