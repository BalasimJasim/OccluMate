import { Link } from 'react-router-dom';
import PatientForm from '../components/Patients/PatientForm';
import PatientList from '../components/Patients/PatientList';

const Dashboard = () => {
  return (
    <div className='dashboard'>
      <h1>Dashboard</h1>
      
      {/* Patient Management Section */}
      <PatientForm />
      <PatientList />
      
      {/* Navigation to other features */}
      <nav>
        <Link to="/appointments/new">New Appointment</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/reminders">Reminders</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>
      
      {/* Patient-specific features will be accessed via PatientList */}
      {/* These routes are accessed when viewing a specific patient:
        - /history/:patientId
        - /dental-chart/:patientId
        - /emr/:patientId
        - /patient-portal/:patientId
        - /prescription/:patientId
      */}
    </div>
  );
};


export default Dashboard;
