import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';


// protects routes by redirecting unauthenticated user to login
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const {user } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (isAuthRoute) {
      document.body.classList.add('auth-body');
    } else {
      document.body.classList.remove('auth-body');
    }
  }, [isAuthRoute]);
  if (isAuthRoute) {
    return (
      <div> 
        <div className="auth-nav">
          <p>LIFE PLANNER RPG</p>
          <Link to="/login" className="auth-nav-link">LOGIN</Link>
          <Link to="/register" className="auth-nav-link">REGISTER</Link>
        </div>
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> 
        </Routes>
      </div>
    );
  }
  
  return (
    <div className="app">
      <div className="main-content"> 
        {/* Setting up the routes */}
        <div className="dashboard-routes"> 
             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dashboard */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;