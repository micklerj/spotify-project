import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import NoPage from './pages/NoPage';
import ProtectedRoute from './components/protectedRoute';



import logo from './logo.svg';


function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/"index element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
