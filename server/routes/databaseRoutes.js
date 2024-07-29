const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');


router.get('/getUser', databaseController.getUser);

router.post('/newUser', databaseController.newUser);

router.put('/updateSongs', databaseController.updateSongs);

router.put('/updateArtists', databaseController.updateArtists);

// router.put('/updateGenres', databaseController.updateGenres);

router.put('/changePrivacy', databaseController.changePrivacy);


module.exports = router;
