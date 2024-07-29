import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import React, {useState, useEffect} from 'react';

function Login() {
  const [authResponse, setAuthResponse] = useState([{}]);

  async function handleLogin() {
    window.location.href = 'http://localhost:3500/api/login';
  }

  return (
    <div className="login page">
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