import Footer from '../components/footerButtons';
import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Button, Row, Card, Navbar, Nav} from 'react-bootstrap';
import axios from 'axios';
// import axios from 'axios';




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
                  recentlyListenedTo: "some song name",    // TODO: replace with actual song name
                  isFollowing: true,                       // TODO: replace with actual following status
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
                    "userID": userID,
                    "follow": ids[index]
                  };
                  axios.put('/api/updateFollowing', putData)      
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

  return (
    <div className="following page">
      <h1>  Following Page </h1>

      <div>
        <Card style={{ width: "400px" }}>
          <Card.Body>
            <Card.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Following
            </Card.Title>
            <ol style={{ display: 'grid', gap: '15px' }}>
              {followingList.map((user, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={user.profilePic} alt="profile pic" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                    <div style={{ marginLeft: '10px' }}>
                      <p style={{ marginBottom: '0' }}>{user.userName}</p>
                      <p style={{ marginTop: '0' }}>{user.recentlyListenedTo}</p>
                    </div>
                  </div>
                  <Button variant="primary" style={{ width: '100px' }}>Unfollow</Button>
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