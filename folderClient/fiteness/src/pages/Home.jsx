import React from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import './Home.css';

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          
          <h1 className="hero-title">
            Transform Your Body with
            <span className="highlight"> Smart Workouts</span>
          </h1>
          
          <p className="hero-description">
            Generate personalized workout plans with AI-powered exercise recommendations.
            Choose your equipment, target your goals, and let our intelligent system
            create the perfect routine for you.
          </p>
          
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/workouts" className="btn btn-primary">
                  <span className="btn-text">View My Workouts</span>
                </Link>
                <Link to="/create-workout" className="btn btn-secondary">
                  <span className="btn-text">Create New Workout</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  <span className="btn-text">Get Started Free</span>
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  <span className="btn-text">Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">AI</div>
            <div className="card-text">AI Generated</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">TARGET</div>
            <div className="card-text">Target Specific</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">FAST</div>
            <div className="card-text">Quick Results</div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="features-header">
          <h2>Why Choose FITENESS?</h2>
          <p>Discover the power of AI-driven fitness planning</p>
        </div>
        
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">AI</div>
            <h3>AI-Generated Exercises</h3>
            <p>Get 5 customized exercises based on your equipment and target muscle groups using advanced AI algorithms</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">EQUIP</div>
            <h3>Equipment-Based Planning</h3>
            <p>Choose up to 2 pieces of equipment you have available and get workouts tailored to your home gym</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">TARGET</div>
            <h3>Target-Specific Training</h3>
            <p>Focus on specific body parts for effective training and faster results with precision targeting</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">TRACK</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your workout history and track your fitness journey with detailed analytics</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">VIDEO</div>
            <h3>Video Tutorials</h3>
            <p>Access YouTube video guides for proper form and technique for every exercise</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">FAST</div>
            <h3>Quick & Efficient</h3>
            <p>Generate complete workout plans in seconds, saving you time and effort in planning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;