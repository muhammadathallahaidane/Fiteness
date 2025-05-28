import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import './Home.css';

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Fitness App</h1>
        <p>Generate personalized workout lists with AI-powered exercise recommendations</p>
        <div className="hero-features">
          <div className="feature">
            <h3>🤖 AI-Generated Exercises</h3>
            <p>Get 5 customized exercises based on your equipment and target muscle groups</p>
          </div>
          <div className="feature">
            <h3>🏋️ Equipment-Based</h3>
            <p>Choose up to 2 pieces of equipment you have available</p>
          </div>
          <div className="feature">
            <h3>🎯 Target-Specific</h3>
            <p>Focus on specific body parts for effective training</p>
          </div>
        </div>
        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/workouts" className="btn btn-primary">
                View My Workouts
              </Link>
              <Link to="/create-workout" className="btn btn-secondary">
                Create New Workout
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;