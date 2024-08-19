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

// update the user's list of top artists, top songs, top genres, profile info, or recently played song 
updateUser = async function(req, res) {
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
addToFollowing = async function(req, res) {
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

// update the user's list of followed users
removeFromFollowing = async function(req, res) {
  try {
    console.log(req.body);

    // Atomically find the user and remove from its list of following
    const updatedUser = await user.findOneAndUpdate(
      { userID: req.body.userID },
      { $pull: { following: req.body.remove } },
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

// get some range of userIDs from DB
getAllUserIDs = async function(req, res) {
  // range of users to get from DB
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || Number.MAX_SAFE_INTEGER;

  try {
    const Users = await user.find().skip(start).limit(limit);
    if (!Users) {
      return res.status(404).json({ message: 'No users found' });
    }

    var UserIDs = [];
    Users.forEach((user) => {
      UserIDs.push(user.userID);
    });

    return res.json({ userIDs: UserIDs });
  }
  catch (err){
    console.log(err);
  }

}

// search for most relavent users
searchUsers = async function(req, res) {

  const searchQuery = req.query.query;
  console.log("search input: ", searchQuery);

  if (!searchQuery) {
    res.json([])
    return
  }

  const pipeline = []

  pipeline.push({
    $search: {
      index: 'user_search', 
      text: {
        query: searchQuery,
        path: ['username', 'userID'],
        fuzzy: {}
      },          
    },
  })  

  pipeline.push({
    $project: {
      _id: 0,
      score: {$meta: 'searchScore'},
      userID: 1, 
    },
  })

  const result = await user.aggregate(pipeline).sort({score: -1}).limit(10)
  res.json(result)
}

// get # of users
getUserCount = async function(req, res) {
  try {
    const count = await user.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
};

// logout (delete session from DB)
logout = async function(req, res) {
  try {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out' });
  }
  catch (err){
    console.log(err);
  }
}

module.exports = { getUser, newUser, updateUser, changePrivacy, addToFollowing, removeFromFollowing, getAllUserIDs, searchUsers, getUserCount, logout };
