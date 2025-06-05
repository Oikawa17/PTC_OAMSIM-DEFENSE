import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import ptcLogo from './images/ptclogo.png';
import ptcfrontVideo from './images/ptcfront.mp4';
import { useEffect } from 'react';

function Login() {
  const [applicationId, setApplicationId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check sessionStorage for session-based login
    const storedApplicationId = sessionStorage.getItem('application_id');
    if (storedApplicationId) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);


  const handleLogin = () => {
    setLoading(true);
    setError('');

    axios.post('http://localhost:5000/login', {
      application_id: applicationId,
      password: password
    })
    .then(res => {
      setLoading(false);
      if (res.data.application_id) {
        localStorage.setItem('application_id', res.data.application_id);
      }

      if (res.data.changePassword) {
        navigate('/change-password', { state: { applicationId } });
      } else {
        navigate('/dashboard');
      }
    })
    .catch(err => {
      setLoading(false);
      setError(err.response?.data || 'Login failed. Please try again.');
    });
  };

  return (
    <div className="login-container">
      <div className="login-left">
        {/* Video background */}
        <video
          className="login-video-bg"
          src={require('./images/ptcfront.mp4')}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="login-right">
        <div className="login-logo-container">
          <img src={ptcLogo} alt="PTC Logo" className="login-logo" />
          <h2>Pateros Technological College</h2>
        </div>

        <div className="login-form">
          <h3>Online Application Management System</h3>
          <p>Sign in to continue</p>

          {error && <p className="error-message">{error}</p>}

          <div className="input-container">
            <input 
              type="text" 
              id="applicationId" 
              placeholder=" "
              required
              value={applicationId} 
              onChange={e => setApplicationId(e.target.value)} 
            />
            <label htmlFor="applicationId">Application ID</label>
          </div>

          <div className="input-container">
            <input 
              type="password" 
              id="password" 
              placeholder=" " 
              required
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <label htmlFor="password">Password</label>
          </div>

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;