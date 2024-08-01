import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Navbar, Nav} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import './styles/footerButtons.css';



function Footer() {

  const location = useLocation();
  const isHome = location.pathname === '/home';
  const isFollowing = location.pathname === '/following';
  const isExplore = location.pathname === '/explore';

  return (
    <div className="header">
      <div className="navbar">
        <div className="nav-item">
          <a href="/home" className="nav-link" onClick={(event) => {if(isHome) event.preventDefault();}}>
            <button className="button round-button">1</button>
          </a>
        </div>
        <div className="nav-item">
          <a href="/following" className="nav-link" onClick={(event) => {if(isFollowing) event.preventDefault();}}>
            <button className="button round-button">2</button>
          </a>
        </div>
        <div className="nav-item">
          <a href="/explore" className="nav-link" onClick={(event) => {if(isExplore) event.preventDefault();}}>
            <button className="button round-button">3</button>
          </a>
        </div>
      </div>
    </div>
  );
}


export default Footer;