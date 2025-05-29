import React from 'react';
import { useDispatch } from 'react-redux';
import { stravaLogin } from '../store/slices/authSlice';

const StravaLoginButton = () => {
  const dispatch = useDispatch();

  const handleStravaLogin = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    
    if (!clientId) {
      console.error('VITE_STRAVA_CLIENT_ID tidak ditemukan di environment variables');
      return;
    }
    
    const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI || 'http://localhost:5173/auth/strava/callback';
    const scope = 'read,activity:read_all';
    
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    
    window.location.href = stravaAuthUrl;
  };

  return (
    <div className="strava-login-container">
      <button 
        onClick={handleStravaLogin}
        className="strava-login-btn"
        style={{
          background: 'linear-gradient(135deg, #FC4C02 0%, #FF6B35 50%, #FC4C02 100%)',
          color: 'white',
          border: '1px solid rgba(252, 76, 2, 0.3)',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          width: '100%',
          marginTop: '10px',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(252, 76, 2, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FC4C02 50%, #FF6B35 100%)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(252, 76, 2, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #FC4C02 0%, #FF6B35 50%, #FC4C02 100%)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(252, 76, 2, 0.3)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h3.065L5.38 0 .228 10.172h3.066"/>
        </svg>
        <span>Login with Strava</span>
      </button>
    </div>
  );
};

export default StravaLoginButton;