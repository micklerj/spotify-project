import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import followingCheck from '../assets/followingCheck.png';
import addFollowerIcon from '../assets/addFollowerIcon.png';
import magnifyingGlass from '../assets/magnifyingGlass.png';
import x from '../assets/x.png';
import submit from '../assets/submit.png';
import Footer from '../components/footerButtons';
import './styles/Explore.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';


function Explore() {
  const [userCount, setUserCount] = useState(0);                          // number of users in the DB
  const [userID, setUserID] = useState('');                               // current user's ID
  const [followedUserIDList, setFollowedUserIDList] = useState([]);       // list of IDs of users that current user follows
  const [userIDList, setuserIDList] = useState([]);                       // list of IDs of users that current user does not follow   
  const [displayList, setDisplayList] = useState([
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
  const [DBindex, setDBindex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [inputHandled, setInputHandled] = useState(false);
  const [initialListLoaded, setInitialListLoaded] = useState(false);
  const [loadFromDB, setLoadFromDB] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationUserID, setConfirmationUserID] = useState(null);
  const [inputSearched, setInputSearched] = useState(false);
  


  // get current userID   and   user count
  useEffect(() => {
    fetch('/api/profileInfo')
      .then(response => response.json())
      .then(data => {
        setUserID(data.id);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });

    fetch('/api/getUserCount')
      .then(response => response.json())
      .then(data => {
        setUserCount(data.count);
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }, []);

  // get the current user's following list from DB
  useEffect(() => {
    if (userID) {               // Make sure ID is not null
      fetch(`/api/getUser?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
          setFollowedUserIDList(data.following);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }, [userID]);

  // get initial list of userIDs to display once followedUserIDList is populated
  useEffect(() => {
    if (followedUserIDList.length > 0 && !initialListLoaded) {
      getDisplayUsers(0);
      console.log('initial list loaded');
      setInitialListLoaded(true);       // Prevents this useEffect from running again
    }
  }, [followedUserIDList]);

  // get the profiles of the users in the display list
  useEffect(() => {
    // userIDList.forEach((userID) => {          // ----------- this version does not retain the order ------------
    //   if (!displayList.some(user => user.userID === userID)) {   
    //     fetch(`/api/getUser?userID=${userID}`)
    //       .then(response => response.json())
    //       .then(data => {
    //         setDisplayList(prevDisplayList => [
    //           ...prevDisplayList,
    //           {
    //             userID: userID,
    //             profilePic: data.profilePic,
    //             userName: data.username,
    //             recentlyListenedTo: data.recentlyPlayed,
    //             isFollowing: false,                       
    //           }
    //         ]);
    //       })
    //       .catch((error) => { 
    //         console.error('Error:', error); 
    //       });
    //   }
    // });
    
    console.log('fetching the profiles of users');
    const fetchUsers = userIDList.map(userID => {
      if (!displayList.some(user => user.userID === userID)) {   // Make sure user is not already in displayList
        return fetch(`/api/getUser?userID=${userID}`)
          .then(response => response.json())
          .then(data => {
            return {
              userID: userID,
              DBID: data.DBID,
              profilePic: data.profilePic,
              userName: data.username,
              recentlyListenedTo: data.recentlyPlayed,
              privacy: data.privacy,
              isFollowing: followedUserIDList.includes(userID),  // Check if userID is followed or not
            };
          })
          .catch((error) => { 
            console.error('Error:', error); 
          });
      }
    });
  
    Promise.all(fetchUsers)
      .then(users => {
        setDisplayList(prevDisplayList => [...prevDisplayList, ...users.filter(Boolean)]);
      });
    
  }, [userIDList]);

  // get at most 15 of userIDs that the user does not follow at a time starting at index DBStartIndex
  async function getDisplayUsers(DBStartIndex = 0) {
    let idString = '';
    const limit = 15;  // cant be more than 50
    fetch(`/api/getAllUserIDs?start=${DBStartIndex}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        // increment DB index
        setDBindex(DBStartIndex + limit);

        data.userIDs.forEach((id) => {
          if (!followedUserIDList.includes(id) && id !== userID) {
            // add userIDs to a string  (spotify endpoint for followCheck only accepts 50 ids at a time)
            if (idString !== '') {
              idString += ',';
            }
            idString += id;
          }      
        });
        // check if current user follows them
        axios.get(`/api/followCheck?ids=${idString}`)
          .then(response => {
            const data = response.data;
            console.log(data);
            if (!Array.isArray(data)) {
              console.error('Error: ', data, ' not an array');
              return;
            }
            const ids = idString.split(',');
            data.forEach((follows, index) => {
              if (!follows) {
                // for any id that is false, add to display list (non-followed user)
                setuserIDList(prevList => [...prevList, ids[index]]);
              }
              else {
                // if they are followed, add them to the current user's list of following in the DB
                const putData = {
                  "userID": userID,      // current user
                  "follow": ids[index]   // followed user
                };
                axios.put('/api/addToFollowing', putData)      
                  .catch((error) => { 
                    console.error('Error:', error); 
                  });
              }
            });
          })
          .catch((error) => { 
            console.error('Error:', error); 
          });
        
      })
      .catch((error) => { 
        console.error('Error:', error); 
      });
  }

  // TODO: actually implement an algorithm for displaying relavent users first
  // (mutual friends, previosuly followed, similar music taste, etc.)

  

   // toggle follow status of a user
   async function handleToggleFollow(otherUserID, wasFollowing) {
    // toggle isFollowing in displayList   (for follow button image)
    setDisplayList(displayList.map(user => 
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
      axios.put('/api/removeFromFollowing', putData)      
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
      axios.put('/api/addToFollowing', putData)      
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }

    // toggle follow with spotify api
    if (wasFollowing) {
      // unfollow
      fetch(`/api/unfollow?id=${otherUserID}`)
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
    else {
      // follow
      fetch(`/api/follow?id=${otherUserID}`)
        .catch((error) => { 
          console.error('Error:', error);
        });
    }

    // update followedUserIDList
    if (wasFollowing) {
      setFollowedUserIDList(followedUserIDList.filter(id => id !== otherUserID));
    }
    else {
      setFollowedUserIDList([...followedUserIDList, otherUserID]);
    }
  }

  // searching for a user
  async function handleInput() {
    setInputSearched(false);
    // clear current userID and display list
    setuserIDList([]);
    setDisplayList([]);

    if (searchInput === '') {
      getDisplayUsers(0);   // gets default users
      setLoadFromDB(true);
    }
    else {
      setLoadFromDB(false);
      setInputHandled(true);
      try {
        const getData = {
          "query": searchInput,       // search query
        };
        const response = await axios.get(`/api/searchUsers?query=${searchInput}`, getData);   
        const users = response.data;      
        console.log(users);      
        // Add each userID from users to userIDList
        let userIDList = [];
        users.forEach(user => {
          userIDList.push(user.userID);
        });
        setuserIDList(userIDList);
        setInputSearched(true);
      } catch (error) {
        console.error(error);
      }   
    } 
  }

  // clear the search input and get default users
  async function handleClearInput() {
    setInputSearched(false);
    setLoadFromDB(true);
    setInputHandled(false);
    setSearchInput('');
    setuserIDList([]);
    setDisplayList([]);

    getDisplayUsers(0);
  }

  return (
    <div className="explore page">
      <div className='explore-title'>
        Explore
      </div>

      <div className="search-bar">
        <img src={magnifyingGlass} alt="Search" />
        <input
          type="text"
          value={searchInput}
          className='search-bar-input'
          onChange={e => {
            setSearchInput(e.target.value);
            setInputHandled(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleInput(); 
            }
          }}
          placeholder="Search"
        />
        <button onClick={inputHandled ? handleClearInput : handleInput} className="search-bar-button">
          <img src={inputHandled ? x : submit} alt="Submit" />
        </button>
      </div>

      {userIDList.length === 0 && inputSearched && (
        <div className='no-users-found'>
          No users found :(

        </div>
      )}

      <div >
        <InfiniteScroll
          dataLength={displayList.length}
          next={() => {
            if (DBindex < userCount && loadFromDB) {
              getDisplayUsers(DBindex);
            }
          }}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          scrollThreshold={0.5}
        >
          <div className='explore-users-container'>
            <ol className="explore-list">
              {displayList.map((user, index) => (
                <li key={index} className="explore-item">
                  <div className="explore-item-content">
                    <img src={user.profilePic} alt="profile pic" className="explore-item-image" />
                    <div className="explore-item-info">
                      <p>
                        <Link to={`/profile/${user.DBID}`} className="exp-username-link">
                          {user.userName}
                        </Link>
                      </p>
                      <DisplayRecentlyPlayed songTitle={user.recentlyListenedTo} />
                    </div>
                  </div>
                  <div>
                    {user.userID !== userID && (user.privacy !== 'Private' || user.isFollowing) && (
                      <button
                        className={`exp-button ${user.isFollowing ? 'exp-unfollow-button' : 'exp-follow-button'}`}                    
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
          {<div style={{ height: '100vh' }} />} {/* Placeholder */}
        </InfiniteScroll>
      </div>

      {showConfirmation && (
        <>
          <div className="exp-overlay" onClick={() => setShowConfirmation(false)}></div>

          <div className="exp-confirmation">
            <p>Are you sure you want to unfollow? This user is private and can't be re-followed.</p>
            <div className="exp-confirm-buttons">
              <button 
                className="exp-confirm-button"
                onClick={() => {
                  handleToggleFollow(confirmationUserID, true);
                  setShowConfirmation(false);
                }}>
                Yes
              </button>
              <button 
                className="exp-confirm-button"
                onClick={() => setShowConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />

    </div>    


  );
}



export default Explore;