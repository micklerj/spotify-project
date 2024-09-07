import React from 'react';
import './styles/Login.css';

function Login() {

  async function handleLogin() {
    window.location.href = 'http://localhost:3500/api/login';
  }

  return (
    <div className="login-page">

      <div className='login-body-container'>

        <div className='title'>
          top listened to
        </div>

        <div className="login-container">
          <p className='h1'>Welcome to top-listened-to</p>
          <p className='h2'>Discover your most played artists, songs, and genres</p>
          <p className='h3'>See what your friends have been listening to, and find new friends with similar music tastes</p>
          <button 
            className="login-button"
            onClick={handleLogin}>
            Login with Spotify
          </button>
          <p className='h4'>Don't have a spotify account?</p>
          <p className='h4'>join <a href='https://www.spotify.com/us/signup'>here</a></p>
        </div>
      </div>

    </div>
  );
}



export default Login;