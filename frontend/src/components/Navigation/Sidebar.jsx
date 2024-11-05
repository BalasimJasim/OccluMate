import { FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// ... other imports

const Sidebar = () => {
  return (
    <nav className="sidebar">
      {/* ... other navigation items */}
      
      {/* Only show for Dentists and Admins */}
      {['Dentist', 'Admin'].includes(user?.role) && (
        <Link to="/templates" className="nav-item">
          <FaFileAlt />
          <span>Templates</span>
        </Link>
      )}
    </nav>
  );
}; 