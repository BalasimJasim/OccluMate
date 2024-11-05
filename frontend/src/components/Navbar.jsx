import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/authContext';
import { 
  FaHome, 
  FaUserInjured, 
  FaCalendarAlt, 
  FaTooth, 
  FaPrescription, 
  FaTasks, 
  FaChartLine, 
  FaSignOutAlt,
  FaUser 
} from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const staffNavLinks = [
    { path: '/', icon: <FaHome />, text: 'Home' },
    { path: '/patients', icon: <FaUserInjured />, text: 'Patients' },
    { path: '/appointments', icon: <FaCalendarAlt />, text: 'Appointments' },
    { path: '/dental-charts', icon: <FaTooth />, text: 'Dental Charts' },
    { path: '/prescriptions', icon: <FaPrescription />, text: 'Prescriptions' },
    { path: '/tasks', icon: <FaTasks />, text: 'Tasks' },
  ];

  // Add analytics link for admin users
  if (user?.role === 'Admin') {
    staffNavLinks.push({ path: '/analytics', icon: <FaChartLine />, text: 'Analytics' });
  }

  const patientNavLinks = [
    { path: '/portal/dashboard', icon: <FaUser />, text: 'My Portal' },
    { path: '/portal/appointments', icon: <FaCalendarAlt />, text: 'My Appointments' },
    { path: '/portal/prescriptions', icon: <FaPrescription />, text: 'My Prescriptions' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <FaTooth className="brand-icon" />
          <span>OccluMate</span>
        </Link>
      </div>
      <div className="nav-links">
        {isLoggedIn && user ? (
          <>
            {/* Show different navigation based on user role */}
            {user.role === 'Patient' ? (
              // Patient Navigation
              <>
                {patientNavLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`nav-link ${isActive(link.path)}`}
                  >
                    {link.icon}
                    <span>{link.text}</span>
                  </Link>
                ))}
              </>
            ) : (
              // Staff Navigation
              <>
                {staffNavLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`nav-link ${isActive(link.path)}`}
                  >
                    {link.icon}
                    <span>{link.text}</span>
                  </Link>
                ))}
              </>
            )}
            <button onClick={handleLogout} className="btn-logout">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </>
        ) : (
          // Not logged in navigation
          <div className="auth-buttons">
            <Link to="/patient-login" className="nav-link primary">
              Patient Portal Login
            </Link>
            <Link to="/login" className="nav-link">
              Staff Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
