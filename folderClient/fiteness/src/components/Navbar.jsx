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
          <span className="brand-icon">💪</span>
          <span className="brand-text">FitnessPro</span>
        </Link>
        
        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <Link 
                to="/workouts" 
                className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏋️</span>
                My Workouts
              </Link>
              <Link 
                to="/create-workout" 
                className={`nav-link ${isActive('/create-workout') ? 'active' : ''}`}
              >
                <span className="nav-icon">➕</span>
                Create Workout
              </Link>
              <div className="user-section">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">Hi, {user?.username || 'User'}!</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <span className="logout-icon">🚪</span>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                <span className="nav-icon">🔑</span>
                Login
              </Link>
              <Link 
                to="/register" 
                className="nav-button register"
              >
                <span className="nav-icon">🚀</span>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;