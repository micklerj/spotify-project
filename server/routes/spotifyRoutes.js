const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

router.get('/login', spotifyController.login);

router.get('/callback', spotifyController.callback);

router.get('/topArtists', spotifyController.topArtists);

router.get('/topSongs', spotifyController.topSongs);

router.get('/topGenres', spotifyController.topGenres);

router.get('/profileInfo', spotifyController.profileInfo);

router.get('/ensureAuth', spotifyController.ensureAuth);

router.get('/followCheck', spotifyController.followCheck);

router.get('/follow', spotifyController.follow);

router.get('/unfollow', spotifyController.unfollow);

router.get('/getRecentlyPlayed', spotifyController.getRecentlyPlayed);

router.get('/getFollowerCount', spotifyController.getFollowerCount);


module.exports = router;
