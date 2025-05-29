import React from 'react';
import { useDispatch } from 'react-redux';
import { stravaLogin } from '../store/slices/authSlice';

const StravaLoginButton = () => {
  const dispatch = useDispatch();

  const handleStravaLogin = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    
    // Pastikan client ID tersedia
    if (!clientId) {
      console.error('VITE_STRAVA_CLIENT_ID tidak ditemukan di environment variables');
      return;
    }
    
    const redirectUri = 'http://localhost:5173/auth/strava/callback';
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
          backgroundColor: '#FC4C02',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
          marginTop: '10px'
        }}
      >
        🏃‍♂️ Login with Strava
      </button>
    </div>
  );
};

export default StravaLoginButton;