import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { stravaLogin } from '../store/slices/authSlice';

const StravaCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Strava OAuth error:', error);
      navigate('/login');
      return;
    }

    if (code) {
      dispatch(stravaLogin(code)).then((result) => {
        if (result.type === 'auth/stravaLogin/fulfilled') {
          navigate('/');
        } else {
          navigate('/login');
        }
      });
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Processing Strava login...</div>
    </div>
  );
};

export default StravaCallback;