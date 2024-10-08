import React, {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './styles/Following.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';
import Footer from '../components/footerButtons';



function Following() {
  const [userID, setUserID] = useState('');               // current user's ID
  const [userIDList, setuserIDList] = useState(null);       // list of IDs of users that current user follows
  const [followingList, setFollowingList] = useState([
    // {
    //   userID: '',
    //   DBID: '',
    //   profilePic: '',
    //   userName: '',
    //   recentlyListenedTo: '',
    //   privacy: '',
    //   isFollowing: true,
    // }
  ]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationUserID, setConfirmationUserID] = useState(null);
  const hasRun = useRef(false);
  const processedUserIDs = useRef(new Set());


  // get current userID
  useEffect(() => {
    fetch('https://spotify-project-lhca.onrender.com/api/profileInfo', { credentials: 'include'})
      .then(response => response.json())
      .then(data => {
        setUserID(data.id);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }, []);

  // first add current user's following list from DB
  useEffect(() => {
    if (!userID) return;               // Make sure ID is not null
    fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${userID}`)
      .then(response => response.json())
      .then(data => {
        setuserIDList(data.following);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
    
  }, [userID]);

  // get the profiles of the users in the following list
  useEffect(() => {
    if (!userIDList) return;      // Make sure list is not null
    
    const fetchUsers = async () => {
      for (const userID of userIDList) {

        if (processedUserIDs.current.has(userID)) { continue }  // Check if userID has already been processed
        processedUserIDs.current.add(userID); 
        
        if (!followingList.some(user => user.userID === userID)) {   // Make sure user is not already in followingList
          try {
            const response = await fetch(`https://spotify-project-lhca.onrender.com/api/getUser?userID=${userID}`);
            const data = await response.json();
            setFollowingList(prevFollowingList => [
              ...prevFollowingList,
              {
                userID: userID,
                DBID: data.DBID,
                profilePic: data.profilePic,
                userName: data.username,
                recentlyListenedTo: data.recentlyPlayed,
                privacy: data.privacy,
                isFollowing: true,                       
              }
            ]);
          } catch (error) {
            console.error('Error:', error);
          }
        }
      }
  
      if (!hasRun.current) {
        // search the DB for other users that current user follows that hasnt been added to the current user's DB object yet
        getOtherFollowedUsers();  
        hasRun.current = true;
      }
    };
  
    fetchUsers();
    
  }, [userIDList]);


  // iterate through every other user on the app and check if current user follows them
  async function getOtherFollowedUsers() {
    let idStrings = [''];
    let count = 0;
    fetch(`https://spotify-project-lhca.onrender.com/api/getAllUserIDs`)
      .then(response => response.json())
      .then(data => {
        data.userIDs.forEach((id) => {
          if (!userIDList.includes(id) && id !== userID) {
            // add userIDs to a string in idStrings[]  (spotify endpoint for followCheck only accepts 50 ids at a time)
            if (count === 50) {
              idStrings.push('');
              count = 0;
            }
            if (idStrings[idStrings.length - 1] !== '') {
              idStrings[idStrings.length - 1] += ',';
            }
            idStrings[idStrings.length - 1] += id;
            count++;
          }
        });
        // check if current user follows them
        for (let idString of idStrings) {
          fetch(`https://spotify-project-lhca.onrender.com/api/followCheck?ids=${idString}`, { credentials: 'include'})
            .then(response => response.json())
            .then(data => {
              // for any id that is true, add to userID list
              const ids = idString.split(',');
              data.forEach((follows, index) => {
                if (follows) {
                  setuserIDList(prevList => [...prevList, ids[index]]);
                  // also add to DB
                  const putData = {
                    "userID": userID,      // current user
                    "follow": ids[index]   // followed user
                  };
                  axios.put('https://spotify-project-lhca.onrender.com/api/addToFollowing', putData)      
                    .catch((error) => { 
                      console.error('Error:', error); 
                    });
                }
              });
            })
            .catch((error) => { 
              console.error('Error:', error); 
            });
        };
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }
  
  //TODO: if # of users grows large enough, implement InfiniteScroll and change how additional followed users are retrieved  

  // toggle follow status of a user
  async function handleToggleFollow(otherUserID, wasFollowing) {
    // toggle isFollowing in followingList   (for follow button image)
    setFollowingList(followingList.map(user => 
      user.userID === otherUserID 
        ? { ...user, isFollowing: !user.isFollowing } 
        : user
    ));

    // remove or add to DB
    if (wasFollowing) {
      // remove 
      const putData = {
        "userID": userID,       // current user
        "remove": otherUserID   // followed user
      };
      axios.put('https://spotify-project-lhca.onrender.com/api/removeFromFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // add
      const putData = {
        "userID": userID,       // current user
        "follow": otherUserID   // followed user
      };
      axios.put('https://spotify-project-lhca.onrender.com/api/addToFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }

    // toggle follow with spotify api
    if (wasFollowing) {
      // unfollow
      fetch(`https://spotify-project-lhca.onrender.com/api/unfollow?id=${otherUserID}`, { credentials: 'include'})
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // follow
      fetch(`https://spotify-project-lhca.onrender.com/api/follow?id=${otherUserID}`, { credentials: 'include'})
        .catch((error) => { 
          console.error('Error:', error);
        });
    }
  }

  //TODO: implement search and infinite scroll
  return (
    <>
      <div className='color-border'>

        <div className='followed-users-container'>
          <div className='list-title'>
            Following
          </div>
          <ol className="following-list">
            {followingList.map((user, index) => (
              <li key={index} className="following-item">
                <div className="following-item-content">
                  <img src={user.profilePic} alt="profile pic" className="following-item-image" />
                  <div className="following-item-info">
                    <p>
                      <Link to={`/profile/${user.DBID}`} className="username-link">
                        {user.userName}
                      </Link>
                    </p>
                    <DisplayRecentlyPlayed songTitle={user.recentlyListenedTo} />
                  </div>
                </div>
                <div>
                  {user.userID !== userID && (user.privacy !== 'Private' || user.isFollowing) && (
                    <button
                      className={`fol-button ${user.isFollowing ? 'fol-unfollow-button' : 'fol-follow-button'}`}                    
                      onClick={() => {
                        if (user.privacy === 'Private' && user.isFollowing) {
                          setConfirmationUserID(user.userID);
                          setShowConfirmation(true);              
                        } else {
                          handleToggleFollow(user.userID, user.isFollowing);
                        }
                      }}
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {showConfirmation && (
          <>
            <div className="fol-overlay" onClick={() => setShowConfirmation(false)}></div>

            <div className="fol-confirmation">
              <p>Are you sure you want to unfollow? This user is private and can't be re-followed.</p>
              <div className='fol-confirm-buttons'>
                <button 
                  className="fol-confirm-button"
                  onClick={() => {
                    handleToggleFollow(confirmationUserID, true);
                    setShowConfirmation(false);
                  }}>
                  Yes
                </button>
                <button 
                  className="fol-confirm-button"
                  onClick={() => setShowConfirmation(false)}>
                  No
                </button>
              </div>
            </div>
          </>
        )}

        
      </div>  
      
      <Footer />
    </>
  );
}



export default Following;