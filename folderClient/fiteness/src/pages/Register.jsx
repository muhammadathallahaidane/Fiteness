import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { registerUser } from '../store/slices/authSlice';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  // State untuk track registrasi berhasil
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/workouts');
    }
  }, [isAuthenticated, navigate]);

  // Tambahkan useEffect untuk redirect setelah register berhasil
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1000); // Delay 2.5 detik setelah SweetAlert
      
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await dispatch(registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })).unwrap();
      
      // Set flag registrasi berhasil
      setRegistrationSuccess(true);
    } catch (error) {
      // Error sudah di-handle di authSlice
      console.error('Registration failed:', error);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const getPasswordStrengthLevel = () => {
    if (passwordStrength < 25) return { level: 'WEAK', color: '#ff4757' };
    if (passwordStrength < 50) return { level: 'FAIR', color: '#ff6348' };
    if (passwordStrength < 75) return { level: 'GOOD', color: '#ffa502' };
    return { level: 'STRONG', color: '#2ed573' };
  };

  const strengthInfo = getPasswordStrengthLevel();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">
            <h1 className="brand-name">FITENESS</h1>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the elite fitness community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" style={{color: "white"}} >Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose your username"
              className={validationErrors.username ? 'error' : ''}
            />
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" style={{color: "white"}}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={validationErrors.email ? 'error' : ''}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" style={{color: "white"}}>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                className={validationErrors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${passwordStrength}%`,
                      backgroundColor: strengthInfo.color
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: strengthInfo.color }}>
                  {strengthInfo.level}
                </span>
              </div>
            )}
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" style={{color: "white"}}>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={validationErrors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              <div className="error-content">
                <strong>Registration Failed</strong>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <button type="submit" className="auth-button primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;