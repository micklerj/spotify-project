require('dotenv').config();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')
const MongoStore = require('connect-mongo');

const app = express();

connectDB();
const corsOptions = { 
  origin: 'http://localhost:3000',
  credentials: true,  
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

app.use(session({             // For production use, store sessions in a persistent store like Redis or a database instead of the default in-memory store to handle scaling and persistence.
  store: MongoStore.create({ 
    mongoUrl: process.env.DATABASE_URI,
    dbName: 'spotifyAppDB',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,  // false = doesnt save unless modified  
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
   }                            // Set secure: true in production with HTTPS
}))

// Middleware for json
app.use(express.json());

// Spotify routes
app.use('/api', require('./routes/spotifyRoutes'));

// database routes
app.use('/api', require('./routes/databaseRoutes'));

app.get('/api/example', (req, res) => {
  res.json({ message: 'Hello from server!' });
});



mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})