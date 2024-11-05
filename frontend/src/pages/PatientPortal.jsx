import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/authContext';
import './PatientPortal.scss';

const PatientPortal = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Redirect non-patients
  if (user && user.role !== 'Patient') {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="patient-portal-container">
      <nav className="portal-nav">
        <button 
          className="nav-btn"
          onClick={() => navigate('/portal/dashboard')}
        >
          Dashboard
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/portal/appointments')}
        >
          Appointments
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/portal/prescriptions')}
        >
          Prescriptions
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/portal/documents')}
        >
          Documents
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/portal/settings')}
        >
          Settings
        </button>
      </nav>

      <main className="portal-content">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientPortal; 