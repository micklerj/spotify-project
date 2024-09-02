require('dotenv').config();
const PORT = process.env.PORT || 3500; // dev backend will run on local port 3500
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

// Trust the first proxy if behind a proxy or load balancer
// app.set('trust proxy', 1);

// session for managing access and refresh tokens
app.use(session({          
  store: MongoStore.create({ 
    mongoUrl: process.env.DATABASE_URI,
    dbName: 'spotifyAppDB',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,      // false = doesnt save unless modified  
  cookie: { 
    secure: false,                // false when in development, true in production (for HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    // sameSite: 'None', // Ensure cookies are sent across different domains
    // path: '/' // Ensure the cookie is available on all routes
   }                             
}))

// Middleware for json
app.use(express.json());

// Spotify routes
app.use('/api', require('./routes/spotifyRoutes'));

// database routes
app.use('/api', require('./routes/databaseRoutes'));

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})