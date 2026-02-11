import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

function Login({ setToken }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse);
      setToken(tokenResponse);
    },
    // Preserving all your required scopes
    scope: 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  });

  return (
    <div style={styles.pageBackground}>
      {/* Semi-transparent overlay to ensure text readability against the background */}
      <div style={styles.overlay}>
        <div style={styles.loginCard}>
          <div style={styles.logoArea}>
            <div style={styles.dummyLogo}>✉️</div>
            <h1 style={styles.title}>KALASAG-MailFlow</h1>
            <p style={styles.subtitle}>Learning about Gmail API and functions.</p>
          </div>

          <button
            style={styles.googleBtn}
            onClick={() => login()}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google G"
              style={styles.googleIcon}
            />
            Sign in with Google
          </button>

          <p style={styles.footerText}>
            Secure authentication powered by Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Professional workspace image
    backgroundImage: 'url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  overlay: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight dark tint
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white
    backdropFilter: 'blur(10px)', // The "Glass" effect
    WebkitBackdropFilter: 'blur(10px)', // Support for Safari
    padding: '50px 40px',
    borderRadius: '24px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.3)', // Soft border for depth
  },
  logoArea: {
    marginBottom: '35px',
  },
  dummyLogo: {
    fontSize: '60px',
    marginBottom: '15px',
  },
  title: {
    fontSize: '32px',
    color: '#1a73e8',
    margin: '0 0 10px 0',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#3c4043',
    margin: 0,
    fontWeight: '400',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffffff',
    color: '#3c4043',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  googleIcon: {
    width: '22px',
    height: '22px',
  },
  footerText: {
    marginTop: '30px',
    fontSize: '13px',
    color: '#5f6368',
    fontWeight: '500',
  }
};

export default Login;