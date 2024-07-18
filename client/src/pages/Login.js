import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';
import Header from '../components/header';

function Login() {
  const [authResponse, setAuthResponse] = useState([{}]);

  async function handleLogin() {
    window.location.href = 'http://localhost:3500/login';
  }

  return (
    <div className="login page">
      <Header />
      <div>
        <p>Login Page</p>
      </div>

      <Button 
        variant="primary"
        onClick={handleLogin}>
        Login with Spotify
      </Button>



    </div>
  );
}



export default Login;