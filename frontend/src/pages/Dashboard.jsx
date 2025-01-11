import { Link } from 'react-router-dom';
import PatientForm from '../components/Patients/PatientForm';
import PatientList from '../components/Patients/PatientList';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Patient Management Section */}
      <div className="space-y-8">
        <PatientForm />
        <PatientList />
      </div>

      {/* Navigation to other features */}
      <nav className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link
          to="/appointments/new"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Appointment
        </Link>
        <Link
          to="/appointments"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Appointments
        </Link>
        <Link
          to="/reminders"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reminders
        </Link>
        <Link
          to="/tasks"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tasks
        </Link>
        <Link
          to="/analytics"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Analytics
        </Link>
      </nav>
    </div>
  );
};

export default Dashboard;
