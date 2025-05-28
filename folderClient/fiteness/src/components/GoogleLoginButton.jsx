import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../store/slices/authSlice';

const GoogleLoginButton = () => {
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
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response) => {
    dispatch(googleLogin(response.credential));
  };

  return (
    <div className="google-login-container">
      <div className="divider">
        <span>atau</span>
      </div>
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleLoginButton;