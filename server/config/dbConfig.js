const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      dbName: "spotifyAppDB"
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectDB