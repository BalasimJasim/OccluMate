import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Auth.scss';

const PatientLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/patient-login', formData);
      
      if (response.data.temporaryPassword) {
        // If using temporary password, redirect to change password
        navigate('/change-password', { 
          state: { patientId: response.data.patientId }
        });
      } else {
        // Normal login - store token and user data
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
          role: 'Patient' // Ensure role is set
        };
        console.log('Setting user data:', userData); // Debug log
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Patient Portal Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({
                ...formData,
                email: e.target.value
              })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({
                ...formData,
                password: e.target.value
              })}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Portal'}
          </button>
        </form>

        <div className="auth-footer">
          <p>First time logging in? Use the temporary password provided by your clinic.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin; 