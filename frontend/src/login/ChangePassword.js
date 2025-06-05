import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing the same stylesheet for design consistency
import ptcLogo from './images/ptclogo.png';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId } = location.state || {};

  const handleChange = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    axios.post('http://localhost:5000/login/change-password', {
      application_id: applicationId,
      newPassword: newPassword
    })
    .then(() => {
      setLoading(false);
      alert('Password changed successfully!');
      navigate('/');
    })
    .catch(() => {
      setLoading(false);
      setError('Failed to update password. Please try again.');
    });
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="./images/ptc.png" alt="Pateros Technological College" />
      </div>
      
      <div className="login-right">
        <div className="login-logo-container">
          <img src={ptcLogo} alt="PTC Logo" className="login-logo" />
          <h2>Pateros Technological College</h2>
        </div>

        <div className="login-form">
          <h3>Online Application Management System</h3>
          <h3>Change Password</h3>
          <p>Please enter a new password</p>
          {error && <p className="error-message">{error}</p>}

          <div className="input-container">
            <input 
              type="password" 
              id="newPassword" 
              placeholder=" " 
              required
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
            <label htmlFor="newPassword">New Password</label>
          </div>

          <div className="input-container">
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder=" " 
              required
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
            <label htmlFor="confirmPassword">Confirm New Password</label>
          </div>

          <button onClick={handleChange} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
