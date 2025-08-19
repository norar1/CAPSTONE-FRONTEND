import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/LoginPage.jsx';
import Signup from './pages/SignUp.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';  
import UserDashboard from './pages/UserDasboard.jsx';   

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      setIsAuthenticated(!!token);
      setRole(storedRole);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/AdminDashboard';
    if (role === 'user') return '/UserDashboard';
    return '/login';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/AdminDashboard" element={isAuthenticated && role === 'admin' ? <AdminDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
        <Route path="/UserDashboard" element={isAuthenticated && role === 'user' ? <UserDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
