const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true 
  },
  profilePic: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  privacy: {
    type: String,
    required: true
  },
  recentlyPlayed: {
    type: String
  },
  following: [{
    type: String
  }],
  topArtists1M: [{
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topArtists6M: [{
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topArtists1Y: [{
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topSongs1M: [{
    songName: {
      type: String,
      required: true
    },
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topSongs6M: [{
    songName: {
      type: String,
      required: true
    },
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topSongs1Y: [{
    songName: {
      type: String,
      required: true
    },
    artistName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  topGenres1M: [{
    type: String
  }],
  topGenres6M: [{
    type: String
  }],
  topGenres1Y: [{
    type: String
  }]
});

module.exports = mongoose.model('user', userSchema);