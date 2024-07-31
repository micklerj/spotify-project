const user = require('../model/user');

// get user based on userID
getUser = async function(req, res) {
  var userID = req.query.userID || null;

  if (userID) {
    try {
      const foundUser = await user.findOne({ userID: userID });
      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json(foundUser);
    }
    catch (err){
      console.log(err);
    }    
  } 
  else {
    return res.status(400).json({ message: 'No ID provided' });
  }
};

// create a new user
newUser = async function(req, res) {
  try {
    userID = req.body.userID;

    // check if the user already exists
    const existingID = await user.findOne({ userID });
    if (!existingID) {
      var newUser = new user(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    }    
  }
  catch (err){
    console.log(err);
  }
}

// update the user's list of top artists
updateArtists = async function(req, res) {
  try {
    // Prepare the update object
    let update = {};
    for (let key in req.body) {
      if (key !== 'userID') {
        update[key] = req.body[key];
      }
    }

    // Atomically find the user and update it
    const updatedUser = await user.findOneAndUpdate(
      { userID: req.body.userID },
      { $set: update },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      return res.status(400).json({ msg: 'user not found' });
    }

    res.status(201).json(updatedUser);
  }
  catch (err){
    console.log(err);
  }
}

// update the user's list of top songs
updateSongs = async function(req, res) {
  try {
    // Prepare the update object
    let update = {};
    for (let key in req.body) {
      if (key !== 'userID') {
        update[key] = req.body[key];
      }
    }

    // Atomically find the user and update it
    const updatedUser = await user.findOneAndUpdate(
      { userID: req.body.userID },
      { $set: update },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      return res.status(400).json({ msg: 'user not found' });
    }

    res.status(201).json(updatedUser);
  }
  catch (err){
    console.log(err);
  }
}
// TODO: possibly combine these functions into 1 since the code is the same^^


// toggle privacy setting
changePrivacy = async function(req, res) {
  try {
    console.log(req.body);

    // Atomically find the user and update its privacy
    const updatedUser = await user.findOneAndUpdate(
      { userID: req.body.userID },
      { $set: { privacy: req.body.privacy } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      return res.status(400).json({ msg: 'user not found' });
    }

    res.status(201).json(updatedUser);
  }
  catch (err){
    console.log(err);
  }
}

// update the user's list of followed users
updateFollowing = async function(req, res) {
  try {
    console.log(req.body);

    // Atomically find the user and append to its list of following
    const updatedUser = await user.findOneAndUpdate(
      { userID: req.body.userID },
      { $push: { following: req.body.follow } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      return res.status(400).json({ msg: 'user not found' });
    }

    // TODO: sort the list of users alphabetically

    res.status(201).json(updatedUser);
  }
  catch (err){
    console.log(err);
  }
}

// iterate through every user in DB
getAllUserIDs = async function(req, res) {
  try {
    const allUsers = await user.find();
    if (!allUsers) {
      return res.status(404).json({ message: 'No users found' });
    }

    var allUserIDs = [];
    allUsers.forEach((user) => {
      allUserIDs.push(user.userID);
    });

    return res.json({ userIDs: allUserIDs });
  }
  catch (err){
    console.log(err);
  }

}


module.exports = { getUser, newUser, updateSongs, updateArtists, changePrivacy, updateFollowing, getAllUserIDs };
