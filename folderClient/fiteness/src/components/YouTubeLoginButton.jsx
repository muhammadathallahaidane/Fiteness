import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { youtubeLogin } from '../store/slices/authSlice';

const YouTubeLoginButton = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('youtube-signin-button'),
          {
            theme: 'filled_red', // YouTube red theme
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response) => {
    console.log('YouTube login response:', response);
    dispatch(youtubeLogin(response.credential));
  };

  return (
    <div className="youtube-login-container">
      <div id="youtube-signin-button"></div>
      <style jsx>{`
        .youtube-login-container {
          margin: 10px 0;
        }
        #youtube-signin-button {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default YouTubeLoginButton;