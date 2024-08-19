const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');


router.get('/getUser', databaseController.getUser);

router.post('/newUser', databaseController.newUser);

router.put('/updateUser', databaseController.updateUser);

// router.put('/updateGenres', databaseController.updateGenres);

router.put('/addToFollowing', databaseController.addToFollowing);

router.put('/removeFromFollowing', databaseController.removeFromFollowing);

router.put('/changePrivacy', databaseController.changePrivacy);

router.get('/getAllUserIDs', databaseController.getAllUserIDs);

router.get('/searchUsers', databaseController.searchUsers);

router.post('/logout', databaseController.logout);

router.get('/getUserCount', databaseController.getUserCount);


module.exports = router;
