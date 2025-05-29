import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router';
import { logout } from '../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">FITENESS</span>
        </Link>
        
        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <Link 
                to="/workouts" 
                className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}
              >
                <span className="nav-text">My Workouts</span>
              </Link>
              <Link 
                to="/create-workout" 
                className={`nav-link ${isActive('/create-workout') ? 'active' : ''}`}
              >
                <span className="nav-text">Create Workout</span>
              </Link>
              <div className="user-section">
                <div className="user-info">
                  <div className="user-avatar">
                    <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="user-name">{user?.username || 'User'}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                <span className="nav-text">Login</span>
              </Link>
              <Link 
                to="/register" 
                className="nav-button register"
              >
                <span className="nav-text">Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;