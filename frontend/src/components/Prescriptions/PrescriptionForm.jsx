import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { createPrescription, getPatientById, getPharmacies } from '../../api';
import './PrescriptionForm.scss';

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'As needed'
];

const DURATIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '30 days'
];

const PrescriptionForm = ({ patientId, onClose, onPrescriptionCreated }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [{
      name: '',
      dosage: '',
      frequency: FREQUENCIES[0],
      duration: DURATIONS[0],
      notes: ''
    }],
    pharmacy: '',
    notes: ''
  });
  const [patient, setPatient] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchPatientData();
    fetchPharmacies();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await getPatientById(patientId);
      setPatient(response.data);
    } catch (err) {
      setError('Failed to fetch patient data');
    }
  };

  const fetchPharmacies = async () => {
    try {
      const response = await getPharmacies();
      setPharmacies(response.data);
    } catch (err) {
      setError('Failed to fetch pharmacies');
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          name: '',
          dosage: '',
          frequency: FREQUENCIES[0],
          duration: DURATIONS[0],
          notes: ''
        }
      ]
    });
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const prescriptionData = {
        ...formData,
        patient: patientId,
        dentist: user._id,
        expiryDate: calculateExpiryDate(formData.medications[0].duration)
      };

      const response = await createPrescription(prescriptionData);
      onPrescriptionCreated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form-modal">
      <div className="modal-header">
        <h2>New Prescription</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Patient Information */}
        <div className="patient-info">
          <h3>Patient Information</h3>
          <p>Name: {patient?.name}</p>
          <p>Age: {patient?.age}</p>
        </div>

        {/* Diagnosis */}
        <div className="form-group">
          <label htmlFor="diagnosis">Diagnosis</label>
          <input
            type="text"
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            required
          />
        </div>

        {/* Medications */}
        <div className="medications-section">
          <h3>Medications</h3>
          {formData.medications.map((medication, index) => (
            <div key={index} className="medication-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Medication Name</label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  >
                    {FREQUENCIES.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={medication.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  >
                    {DURATIONS.map(dur => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showAdvanced && (
                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    value={medication.notes}
                    onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                    placeholder="Enter any special instructions..."
                  />
                </div>
              )}

              {formData.medications.length > 1 && (
                <button
                  type="button"
                  className="btn remove"
                  onClick={() => removeMedication(index)}
                >
                  Remove Medication
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn add"
            onClick={addMedication}
          >
            Add Another Medication
          </button>
        </div>

        <div className="form-group">
          <label>Pharmacy</label>
          <select
            value={formData.pharmacy}
            onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
            required
          >
            <option value="">Select Pharmacy</option>
            {pharmacies.map(pharmacy => (
              <option key={pharmacy._id} value={pharmacy._id}>
                {pharmacy.name} - {pharmacy.address}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes..."
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm; 