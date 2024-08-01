import Footer from '../components/footerButtons';
import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import axios from 'axios';
import followingCheck from '../assets/followingCheck.png';
import addFollowerIcon from '../assets/addFollowerIcon.png';
import './styles/Following.css';
import DisplayRecentlyPlayed from '../components/recentlyPlayed';



function Following() {
  const [userID, setUserID] = useState('');               // current user's ID
  const [userIDList, setuserIDList] = useState([]);       // list of IDs of users that current user follows
  const [followingList, setFollowingList] = useState([
    // {
    //   userID: '',
    //   profilePic: '',
    //   userName: '',
    //   recentlyListenedTo: '',
    //   isFollowing: true,
    // }
  ]);
  


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

  // first add current user's following list from DB
  useEffect(() => {
    if (userID) {               // Make sure ID is not null
      fetch(`/api/getUser?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
          setuserIDList(data.following);
        })
        .catch((error) => { 
          console.error('Error:', error); 
        });
    }
  }, [userID]);

  // get the profiles of the users in the following list
  useEffect(() => {
    if (userIDList) {                      // Make sure followingList is not null
      userIDList.forEach((userID) => {
        if (!followingList.some(user => user.userID === userID)) {   // Make sure user is not already in followingList
          fetch(`/api/getUser?userID=${userID}`)
            .then(response => response.json())
            .then(data => {
              setFollowingList(prevFollowingList => [
                ...prevFollowingList,
                {
                  userID: userID,
                  profilePic: data.profilePic,
                  userName: data.username,
                  recentlyListenedTo: data.recentlyPlayed,
                  isFollowing: true,                       
                }
              ]);
            })
            .catch((error) => { 
              console.error('Error:', error); 
            });
        }
      });
    }
  }, [userIDList]);


  // iterate through every other user on the app and check if current user follows them
  async function getOtherFollowedUsers() {
    let idStrings = [''];
    let count = 0;
    fetch(`/api/getAllUserIDs`)
      .then(response => response.json())
      .then(data => {
        data.userIDs.forEach((id) => {
          if (!userIDList.includes(id) && id !== userID) {
            // add userIDs to a string
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
              // for any id that is true, add to userID list
              console.log(idString);
              console.log(data);
              const ids = idString.split(',');
              data.forEach((follows, index) => {
                if (follows) {
                  setuserIDList(prevList => [...prevList, ids[index]]);
                  // also add to DB
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
  }

  return (
    <div className="following page">
      <h1>  Following Page </h1>

      <div>
        <Card style={{ width: "400px" }}>
          <Card.Body>
            <Card.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Following
            </Card.Title>
            <ol className="following-list">
              {followingList.map((user, index) => (
                <li key={index} className="following-item">
                  <div className="following-item-content">
                    <img src={user.profilePic} alt="profile pic" className="following-item-image" />
                    <div className="following-item-info">
                      <p>{user.userName}</p>
                      <DisplayRecentlyPlayed songTitle={user.recentlyListenedTo} />
                    </div>
                  </div>
                  <div className="image-container">
                    <img 
                      src={user.isFollowing ? followingCheck : addFollowerIcon} 
                      alt="Button image" 
                      onClick={() => handleToggleFollow(user.userID, user.isFollowing)}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Card.Body>
        </Card>
      </div>

      <div>
        <Button variant="primary" style={{ width: '100px' }} onClick={getOtherFollowedUsers}>
          add other followed users
        </Button>
      </div>

      <Footer />
    </div>    


  );
}



export default Following;