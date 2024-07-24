const user = require('../model/user');

getUser = function(req, res) {
  user.find({}, function(err, user) {
    if (err) {
      res.send(err);
    }
    res.json(user);
  });
};

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



module.exports = { getUser, newUser, updateSongs, updateArtists };