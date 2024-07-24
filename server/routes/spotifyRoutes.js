const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

router.get('/login', spotifyController.login);

router.get('/callback', spotifyController.callback);

router.get('/topArtists', spotifyController.topArtists);

router.get('/topSongs', spotifyController.topSongs);

// router.get('/topGenres', spotifyController.topGenres);

router.get('/profileInfo', spotifyController.profileInfo);


module.exports = router;
