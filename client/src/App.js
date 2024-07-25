import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import NoPage from './pages/NoPage';
import ProtectedRoute from './components/protectedRoute';

// TODO: switch / to home and /login to login

import logo from './logo.svg';


function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/"index element={<Login />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
