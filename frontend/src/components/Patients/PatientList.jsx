import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients, deletePatient } from '../../api';
import ConfirmDialog from '../common/ConfirmDialog';
import PatientEditModal from './PatientEditModal';
import './PatientList.scss';

const PatientList = () => {
  // Initialize patients as an empty array
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, patient: null });
  const [editModal, setEditModal] = useState({ show: false, patient: null });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatients();
      // Set patients directly from response.data
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients. Please try again later.');
      console.error('Error fetching patients:', err);
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
        setError(response.data.message || 'Failed to delete patient');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete patient';
      setError(errorMessage);
      console.error('Error deleting patient:', err);
      
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
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="patient-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return <div className="patient-list-error">{error}</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patient List</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="total-patients">
          Total Patients: {patients.length}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="no-patients">
          <p>No patients found.</p>
        </div>
      ) : (
        <div className="patient-grid">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <div className="patient-details">
                  <p><i className="fas fa-envelope"></i> {patient.email}</p>
                  <p><i className="fas fa-phone"></i> {patient.phone}</p>
                  <p><i className="fas fa-map-marker-alt"></i> {patient.address.city}</p>
                </div>
              </div>
              <div className="patient-actions">
                <Link 
                  to={`/patients/${patient._id}`} 
                  className="btn view"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleEdit(patient)}
                  className="btn edit"
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  onClick={() => handleDelete(patient)}
                  className="btn delete"
                >
                  <i className="fas fa-trash"></i> Delete
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
