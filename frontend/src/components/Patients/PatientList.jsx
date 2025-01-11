import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients, deletePatient } from '../../api';
import ConfirmDialog from '../common/ConfirmDialog';
import PatientEditModal from './PatientEditModal';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    patient: null,
  });
  const [editModal, setEditModal] = useState({ show: false, patient: null });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatients();
      // Set patients directly from response.data
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch patients. Please try again later.");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (patient) => {
    setDeleteConfirm({ show: true, patient });
  };

  const handleEdit = (patient) => {
    setEditModal({ show: true, patient });
  };

  const confirmDelete = async () => {
    try {
      const response = await deletePatient(deleteConfirm.patient._id);
      if (response.data.success) {
        // Refresh the patients list
        await fetchPatients();
        setDeleteConfirm({ show: false, patient: null });
      } else {
        setError(response.data.message || "Failed to delete patient");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete patient";
      setError(errorMessage);
      console.error("Error deleting patient:", err);

      // Show error in UI for 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handlePatientUpdated = async () => {
    await fetchPatients();
    setEditModal({ show: false, patient: null });
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Patient List</h2>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Total Patients: {patients.length}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {patient.name}
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    {patient.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaPhone className="w-4 h-4 mr-2" />
                    {patient.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    {patient.address.city}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-x-3">
                <Link
                  to={`/patients/${patient._id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleEdit(patient)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaEdit className="w-4 h-4 mr-1.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(patient)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaTrash className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, patient: null })}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteConfirm.patient?.name}? This action cannot be undone.`}
        type="danger"
      />

      {/* Edit Modal */}
      {editModal.show && (
        <PatientEditModal
          patient={editModal.patient}
          onClose={() => setEditModal({ show: false, patient: null })}
          onPatientUpdated={handlePatientUpdated}
        />
      )}
    </div>
  );
};

export default PatientList;
