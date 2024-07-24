const PORT = process.env.port || 3500; //backend will run on local port 3500
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')

connectDB();
const corsOptions = { 
  origin: 'http://localhost:3000',
  credentials: true,  
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

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