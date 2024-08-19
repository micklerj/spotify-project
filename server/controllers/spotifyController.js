const request = require('request');
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();
const qs = require('qs');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3500/api/callback'


var stateKey = 'spotify_auth_state';

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

// spotify authorization
login = function(req, res) {

  var state = generateRandomString(16);
  var scope = 'user-top-read user-follow-read user-read-recently-played user-follow-modify';
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    }));
};

// request refresh and access tokens after checking the state parameter,        creates new user in DB if needed
callback = function(req, res) {
  console.log('callback');
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('http://localhost:3000?' +
      querystring.stringify({
        error: 'state_mismatch'
      })
    );
  } else if (code === null) {
    res.redirect('http://localhost:3000?' +
      querystring.stringify({
        error: 'not_authorized'
      })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) { 
 
        req.session.accessToken = body.access_token,
        req.session.refreshToken = body.refresh_token;
        req.session.tokenExpirationTime = Date.now() + (body.expires_in * 1000); // 1 hour in milliseconds

        // --------------------------------------------------------------------------
        // create new user if it doesn't exist
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + req.session.accessToken },
          json: true 
        };
      
        request.get(options, async function(error, response, body) {
          // if (body.images && body.images.length > 1) {
            const postData = {
              "username": body.display_name,
              "profilePic": body.images[1] ? body.images[1].url : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
              "userID": body.id,
              "privacy": "Public",
              "recentlyPlayed": "",
              "following": [],
              "topArtists1M": [],
              "topArtists6M": [],
              "topArtists1Y": [],
              "topSongs1M": [],
              "topSongs6M": [],
              "topSongs1Y": [],
              "topGenres1M": [],
              "topGenres6M": [],
              "topGenres1Y": []
            }

            await axios.post('http://localhost:3500/api/newUser', postData)
              .catch((error) => { 
                console.error('Error:', error);
              })
          // }
          // --------------------------------------------------------------------------
        });

        res.redirect('http://localhost:3000/profile');
      } else {
        res.redirect('http://localhost:3000?' +
          querystring.stringify({
            error: 'invalid_token'
          })
        );
      }
    });
  }
};

// get request for top artists
topArtists = function(req, res) {
  var timeFrame = req.query.timeFrame || 'short_term'; // Use the timeframe query parameter if it exists, otherwise default to 'long_term'
  var count = req.query.count || 10; 
  var init = req.query.init === 'true'; 
  var options = {
    url: 'https://api.spotify.com/v1/me/top/artists?' +
      querystring.stringify({
        time_range: timeFrame,    // short_term = 1M, medium_term = 6M, long_term = 1Y
        limit: count,
        offset: 0
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };

  request.get(options, async function(error, response, body) {
    // update database if init is true (first rendering of the user's profile)
    if (init) {
      // get user ID
      const profileBody = await getProfileInfo(req.session.accessToken);
      var userID = profileBody.id;

      // set timeframe for updated database content
      var topArtistsTime = '';
      if      (timeFrame === 'short_term')  { topArtistsTime = 'topArtists1M'; }
      else if (timeFrame === 'medium_term') { topArtistsTime = 'topArtists6M'; }
      else                                  { topArtistsTime = 'topArtists1Y'; }

      // create array of song objects
      const artistArray = body.items.map(item => ({
        artistName: item.name,
        image: item.images[0].url,
        url: item.external_urls.spotify
      }));

      const putData = {
        "userID": userID,
        [topArtistsTime]: artistArray
      }

      axios.put('http://localhost:3500/api/updateUser', putData)
        .catch((error) => { 
          console.error('Error:', error);
        })
    }
    res.json(body);
  });
};

// get request for top songs
topSongs = function(req, res) {
  var timeFrame = req.query.timeFrame || 'short_term';
  var count = req.query.count || 10; 
  var init = req.query.init === 'true'; 
  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?' +
      querystring.stringify({
        time_range: timeFrame,
        limit: count,
        offset: 0
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };

  request.get(options, async function(error, response, body) { 
    // update database if init is true (first rendering of the user's profile)
    if (init) {
      // get user ID
      const profileBody = await getProfileInfo(req.session.accessToken);
      var userID = profileBody.id;

      // set timeframe for updated database content
      var topSongsTime = '';
      if      (timeFrame === 'short_term')  { topSongsTime = 'topSongs1M'; }
      else if (timeFrame === 'medium_term') { topSongsTime = 'topSongs6M'; }
      else                                  { topSongsTime = 'topSongs1Y'; }

      // create array of song objects
      const songArray = body.items.map(item => ({
        songName: item.name,
        artistName: item.artists[0].name,
        image: item.album.images[0].url,
        url: item.external_urls.spotify
      }));

      const putData = {
        "userID": userID,
        [topSongsTime]: songArray
      }

      axios.put('http://localhost:3500/api/updateUser', putData)
        .catch((error) => { 
          console.error('Error:', error);
        })
    }
    res.json(body);
  });
};

// get request for top genres
topGenres = async function(req, res) {
  var timeFrame = req.query.timeFrame || 'short_term';
  var init = req.query.init === 'true'; 

  var genreRanks = new Map();

  // get top 50 songs -> song's artist -> artist's genres
  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?' +
      querystring.stringify({
        time_range: timeFrame,
        limit: 50,
        offset: 0
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };
  try {
    const response = await axios.get(options.url, { headers: options.headers });
    await Promise.all(response.data.items.map(async (item, index) => {
      const artistID = item.artists[0].id;
      var artistOptions = {
        url: `https://api.spotify.com/v1/artists/${artistID}`,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + req.session.accessToken 
        }
      };
  
      try {
        const artistResponse = await axios.get(artistOptions.url, { headers: artistOptions.headers });
        artistResponse.data.genres.forEach(genre => {
          // Add points to the genre in the map
          var points = genreRanks.get(genre) || 0;
          points += 50 - index;
          genreRanks.set(genre, points);
        });
      } catch (error) {
        console.error(error);
      }
    }));
  } catch (error) {
    console.error(error);
  }

  // get top 50 artists -> artist's genres
  var options2 = {
    url: 'https://api.spotify.com/v1/me/top/artists?' +
      querystring.stringify({
        time_range: timeFrame,   
        limit: 50,
        offset: 0
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    }
  };
  
  try {
    const response = await axios.get(options2.url, { headers: options2.headers });
    response.data.items.forEach((item, index) => {
      item.genres.forEach(genre => {
        // Add points to the genre in the map
        var points = genreRanks.get(genre) || 0;
        points += 50 - index;
        genreRanks.set(genre, points);
      });
    });
  } catch (error) {
    console.error(error);
  }

  // Convert the Map to an array and sort it
  var sortedGenreRanks = Array.from(genreRanks.entries()).sort((a, b) => b[1] - a[1]);

  // update database if init is true (first rendering of the user's profile)
  if (init) {
    // get user ID
    const profileBody = await getProfileInfo(req.session.accessToken);
    var userID = profileBody.id;

    // set timeframe for updated database content
    var topGenresTime = '';
    if      (timeFrame === 'short_term')  { topGenresTime = 'topGenres1M'; }
    else if (timeFrame === 'medium_term') { topGenresTime = 'topGenres6M'; }
    else                                  { topGenresTime = 'topGenres1Y'; }

    const putData = {
      "userID": userID,
      [topGenresTime]: sortedGenreRanks.slice(0, 10).map(pair => pair[0])
    }

    await axios.put('http://localhost:3500/api/updateUser', putData)
      .catch((error) => { 
        console.error('Error:', error);
      })
  }

  res.json(sortedGenreRanks.slice(0, 50));
}

// TODO: delete this function and route
test = function(req, res) {
  if (req.session.name) {
    console.log(req.session.name);
  }
  req.session.test = 'test123';
  req.session.name = "bob";
  res.json(req.session);
}

// get request for profile picture and display_name(username)
profileInfo = function(req, res) {
  getProfileInfo(req.session.accessToken)
    .then(body => {
      res.json(body);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    });  
};

function getProfileInfo(accessToken) {
  return new Promise((resolve, reject) => {
    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true 
    };

    request.get(options, function(error, response, body) {   // TODO: switch all requests to axios
      if (error) {
        reject(error);
      }
      resolve(body);
    });
  });
}

// logic for checking if a user is authenticated
ensureAuth = async function(req, res, next) {
  if (!req.session.accessToken || !req.session.refreshToken) {
    // user is not authenticated
    console.log('User is not authenticated');
    return res.json({ isAuthenticated: 'false' });
    // res.redirect('http://localhost:3000'); 
  }
  
  const currentTime = Date.now();
  if (req.session.tokenExpirationTime && currentTime > req.session.tokenExpirationTime) {
    try {
      await refreshAccessToken(req);
    } catch (error) {
      return res.status(500).send('Error refreshing access token');
    }
  }
  console.log('User is authenticated');
  return res.json({ isAuthenticated: 'true' });
}

// refresh access token
async function refreshAccessToken(req) {
  console.log('refreshing access token');
  const authOptions = {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
    },
    data: qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: req.session.refreshToken
    })
  };

  try {
    const response = await axios(authOptions);
    req.session.accessToken = response.data.access_token;
    req.session.tokenExpirationTime = Date.now() + (60 * 60 * 1000);  // 1 hour in milliseconds
    // req.session.refreshToken = response.data.refresh_token;        // wasn't working but i dont think this is needed 
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
}

// check if current user is following other user(s)
followCheck = function(req, res) {
  // TODO: this sometimes and works and sometimes does not. no clue why
  const ids = req.query.ids;
  var options = {
    url: 'https://api.spotify.com/v1/me/following/contains?' +
      querystring.stringify({
        type: 'user',
        ids: ids
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };
  console.log(options);

  request.get(options, async function(error, response, body) {   
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch from Spotify API' });
      return;
    }
  
    if (response.statusCode !== 200) {
      console.error('Error:', response.statusCode, body);
      res.status(response.statusCode).json({ error: 'Failed to fetch from Spotify API' });
      return;
    }
  
    if (body === undefined) {
      console.error('Error: body is undefined');
      res.status(500).json({ error: 'No data returned from Spotify API' });
      return;
    }
  
    console.log(body);
    res.json(body);
  });
}

// follow user on spotify
follow = function(req, res) {
  const id = req.query.id;
  var options = {
    url: 'https://api.spotify.com/v1/me/following?' +
      querystring.stringify({
        type: 'user',
        ids: id
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };

  request.put(options, async function(error, response, body) {   
    res.json({status: 'successfully followed user'});
  });
}

// unfollow user on spotify
unfollow = function(req, res) {
  const id = req.query.id;
  var options = {
    url: 'https://api.spotify.com/v1/me/following?' +
      querystring.stringify({
        type: 'user',
        ids: id
      }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };

  request.delete(options, async function(error, response, body) {   
    res.json({status: 'successfully unfollowed user'});
  });
}

// get recently played songs
// note: this spotify endpoint isn't always the most accurate
getRecentlyPlayed = function(req, res) {
  var options = {
    url: 'https://api.spotify.com/v1/me/player/recently-played?' +
    querystring.stringify({
      limit: 1
    }),
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.session.accessToken 
    },
    json: true 
  };

  request.get(options, async function(error, response, body) {   
    res.json(body);
  });
}

module.exports = { login, callback, topArtists, topSongs, topGenres, profileInfo, test, ensureAuth, followCheck, follow, unfollow, getRecentlyPlayed };