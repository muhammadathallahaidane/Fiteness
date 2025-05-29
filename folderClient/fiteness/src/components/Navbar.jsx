import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router';
import { logout } from '../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-text">FITENESS</span>
        </Link>
        
        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link 
                to="/workouts" 
                className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-text">My Workouts</span>
              </Link>
              <Link 
                to="/create-workout" 
                className={`nav-link create-workout-btn ${isActive('/create-workout') ? 'active' : ''}`}
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Login</span>
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;