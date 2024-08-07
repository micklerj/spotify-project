import Footer from '../components/footerButtons';
import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import followingCheck from '../assets/followingCheck.png';
import addFollowerIcon from '../assets/addFollowerIcon.png';
import magnifyingGlass from '../assets/magnifyingGlass.png';
import x from '../assets/x.png';
import submit from '../assets/submit.png';
import './styles/Explore.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';


function Explore() {
  const [userID, setUserID] = useState('');                               // current user's ID
  const [followedUserIDList, setFollowedUserIDList] = useState([]);       // list of IDs of users that current user follows
  const [userIDList, setuserIDList] = useState([]);                       // list of IDs of users that current user does not follow   
  const [displayList, setDisplayList] = useState([
    // {
    //   userID: '',
    //   profilePic: '',
    //   userName: '',
    //   recentlyListenedTo: '',
    //   isFollowing: true,
    // }
  ]);
  const [DBindex, setDBindex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [inputHandled, setInputHandled] = useState(false);
  const [initialListLoaded, setInitialListLoaded] = useState(false);


  


  // get current userID
  useEffect(() => {
    fetch('/api/profileInfo')
      .then(response => response.json())
      .then(data => {
        setUserID(data.id);
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
      setInitialListLoaded(true);
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
    
    const fetchUsers = userIDList.map(userID => {
      if (!displayList.some(user => user.userID === userID)) {   // Make sure user is not already in displayList
        return fetch(`/api/getUser?userID=${userID}`)
          .then(response => response.json())
          .then(data => ({
            userID: userID,
            profilePic: data.profilePic,
            userName: data.username,
            recentlyListenedTo: data.recentlyPlayed,
            isFollowing: followedUserIDList.includes(userID),  // Check if userID is followed or not
          }))
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

  // get at most 15 of userIDs that the user does not follow at a time
  async function getDisplayUsers(DBStartIndex) {
    let idStrings = [''];
    let count = 0;
    const limit = 15;
    fetch(`/api/getAllUserIDs?start=${DBStartIndex}&limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        // increment DB index
        setDBindex(DBStartIndex + limit);

        data.userIDs.forEach((id) => {
          if (!followedUserIDList.includes(id) && id !== userID) {
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
          fetch(`/api/followCheck?ids=${idString}`)
            .then(response => response.json())
            .then(data => {
              // for any id that is false, add to display list (non-followed user)
              console.log(data);
              const ids = idString.split(',');
              data.forEach((follows, index) => {
                if (!follows) {
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
        };
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

  async function handleInput() {
    console.log(searchInput);
    // clear current userID and display list
    setuserIDList([]);
    setDisplayList([]);

    if (searchInput === '') {
      getDisplayUsers(0);   // gets default users
    }
    else {
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

      } catch (error) {
        console.error(error);
      }   
    } 
  }

  // clear the search input and get default users
  async function handleClearInput() {
    setInputHandled(false);
    setSearchInput('');
    setuserIDList([]);
    setDisplayList([]);

    getDisplayUsers(0);
  }

  return (
    <div className="explore page">
      <h1>  Explore Page </h1>

      <div className="search-bar">
        <img src={magnifyingGlass} alt="Search" />
        <input
          type="text"
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value);
            setInputHandled(false);
          }}
          onKeyPress={e => {
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

      <div >
        <InfiniteScroll
          dataLength={displayList.length}
          next={() => getDisplayUsers(DBindex)}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
          <div>
            <Card style={{ width: "400px" }}>
              <Card.Body>
                <ol className="following-list">
                  {displayList.map((user, index) => (
                    <li key={index} className="following-item">
                      <div className="following-item-content">
                        <img src={user.profilePic} alt="profile pic" className="following-item-image" />
                        <div className="following-item-info">
                          <p>{user.userName}</p>
                          <DisplayRecentlyPlayed songTitle={user.recentlyListenedTo} />
                        </div>
                      </div>
                      <div className="follow-image-container">
                        {user.userID !== userID && (
                          <img 
                            src={user.isFollowing ? followingCheck : addFollowerIcon} 
                            alt="Button image" 
                            onClick={() => handleToggleFollow(user.userID, user.isFollowing)}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card.Body>
            </Card>
          </div>
          {<div style={{ height: '100vh' }} />} {/* Placeholder */}
        </InfiniteScroll>
      </div>


      <Footer />
    </div>    


  );
}



export default Explore;