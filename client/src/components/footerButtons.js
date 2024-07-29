import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Navbar, Nav} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';



function Footer() {

  const location = useLocation();
  const isHome = location.pathname === '/home';
  const isFollowing = location.pathname === '/following';
  const isExplore = location.pathname === '/explore';

  return (
    <div className="header">
      <Navbar fixed="bottom" bg="light" className="justify-content-center">
        <Nav.Item>
          <Nav.Link href="/home" onClick={(e) => isHome && e.preventDefault()}>
            <Button variant="secondary" style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}>1</Button>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
        <Nav.Link href="/following" onClick={(e) => isFollowing && e.preventDefault()}>
            <Button variant="secondary" style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}>2</Button>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
        <Nav.Link href="/explore" onClick={(e) => isExplore && e.preventDefault()}>
            <Button variant="secondary" style={{ borderRadius: '50%', width: '30px', height: '30px', marginLeft: '10px', fontSize: '10px', whiteSpace: 'nowrap' }}>3</Button>
          </Nav.Link>
        </Nav.Item>
      </Navbar>
    </div>
  );
}


export default Footer;