import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NoPage from './pages/NoPage';
import Following from './pages/Following';
import Explore from './pages/Explore';
import ProtectedRoute from './components/protectedRoute';


import logo from './logo.svg';


function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/"index element={<Login />} />
          <Route path="/profile/:DBID?" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/following" element={ 
            <ProtectedRoute >
              <Following /> 
            </ProtectedRoute>
          } />
          <Route path="/explore" element={ 
            <ProtectedRoute>
              <Explore /> 
            </ProtectedRoute>
          } />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
