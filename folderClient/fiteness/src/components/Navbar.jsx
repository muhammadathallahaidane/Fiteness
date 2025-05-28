import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { logout } from '../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          💪 Fitness App
        </Link>
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <Link to="/workouts" className="nav-link">
                My Workouts
              </Link>
              <Link to="/create-workout" className="nav-link">
                Create Workout
              </Link>
              <span className="nav-user">Hi, {user?.username || 'User'}!</span>
              <button onClick={handleLogout} className="nav-button logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-button register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;