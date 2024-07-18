const PORT = process.env.port || 3500; //backend will run on local port 3500
const express = require('express');
const request = require('request');
const crypto = require('crypto');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const app = express();

const corsOptions = { 
  origin: 'http://localhost:3000',
  credentials: true,  
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

const CLIENT_ID = '9b655af69eb243c98069a6c4965afc16'
const CLIENT_SECRET = '15de6297eacb4dcb968f9930725f8bf5'
const REDIRECT_URI = 'http://localhost:3500/callback'

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';
// temporarily storing access and refresh tokens here
let accessToken = null;
let refreshToken = null;

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  var scope = 'user-top-read';
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
});

app.get('/callback', function(req, res) {
  console.log('callback called');

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('http://localhost:3000' +
      '?' + querystring.stringify({
        error: 'state_mismatch'
      })
    );
  } else if (code === null) {
    console.log('test1');
    res.redirect('http://localhost:3000' +
      '?' + querystring.stringify({
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
 
        accessToken = body.access_token,
        refreshToken = body.refresh_token;
        //TODO: store the tokens in a database instead
        //TODO: manage refresh tokens

        res.redirect('http://localhost:3000/home');
      } else {
        res.redirect('http://localhost:3000' +
          '?' + querystring.stringify({
            error: 'invalid_token'
          })
        );
      }
    });
  }
});


app.get('/api/topArtists', (req, res) => {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true 
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    console.log(body.display_name);
    res.json(body);
  });
});

app.get('/api/profilePic', (req, res) => {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true 
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    if (body.images && body.images.length > 1) {
      console.log(body.images[1].url);
      res.json({pic: body.images[1].url});
    }
    // TODO: if image doesnt exist, make a default one 
  });
});


app.get('/api/example', (req, res) => {
  res.json({ message: 'Hello from server!' });
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
