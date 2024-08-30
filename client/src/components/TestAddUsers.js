import axios from 'axios';
import React from 'react';


function TestAddUsers() {
    

  const generateRandomUsers = async () => {
    const userCount = 170; // Number of users to generate
    const defaultProfilePic = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const defaultImage = 'https://via.placeholder.com/150';
    const defaultString = 'default';

    for (let i = 130; i < userCount; i++) {
      const postData = {
        username: `user${Math.floor(Math.random() * 10000)}`,
        profilePic: defaultProfilePic,
        userID: `id${Math.floor(Math.random() * 10000)}`,
        DBID: i + 1, // Custom ID
        privacy: 'Public',
        recentlyPlayed: defaultString,
        following: [],
        topArtists1M: [
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topArtists6M: [
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topArtists1Y: [
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString },
          { artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topSongs1M: [
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topSongs6M: [
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topSongs1Y: [
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString },
          { songName: defaultString, artistName: defaultString, image: defaultImage, url: defaultString }
        ],
        topGenres1M: [defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString],
        topGenres6M: [defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString],
        topGenres1Y: [defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString,defaultString]
      };

      try {
        await axios.post('/api/newUser', postData);
        console.log(`User ${i + 1} created successfully`);
      } catch (error) {
        console.error(`Error creating user ${i + 1}:`, error);
      }
    }
  };

  return (
    <button onClick={generateRandomUsers}>
      Generate Random Users
    </button>
  );

}

export default TestAddUsers;