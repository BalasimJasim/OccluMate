import React, { useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getMedicalRecord, updateMedicalRecord } from '../../api';
import moment from 'moment';
import './MedicalRecord.scss';
import { FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/authContext';

const MedicalRecord = ({ patientId }) => {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log('Current user:', user);
    console.log('Can edit:', ['Dentist', 'Admin'].includes(user?.role));
  }, [user]);

  useEffect(() => {
    console.log('AuthContext state:', {
      user,
      userRole: user?.role,
      isUserDefined: !!user,
      storedUser: localStorage.getItem('user'),
      storedToken: localStorage.getItem('token')
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Try to reload user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Reloaded user from localStorage:', parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }, [user]);

  const canEdit = useMemo(() => {
    const hasPermission = ['Dentist', 'Admin'].includes(user?.role);
    console.log('Permission check:', {
      userRole: user?.role,
      allowedRoles: ['Dentist', 'Admin'],
      hasPermission
    });
    return hasPermission;
  }, [user]);

  useEffect(() => {
    fetchMedicalRecord();
  }, [patientId]);

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true);
      const response = await getMedicalRecord(patientId);
      setMedicalRecord(response.data);
    } catch (err) {
      setError('Failed to fetch medical record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({ ...medicalRecord });
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const cleanedData = {
        diagnoses: editData.diagnoses.map(d => ({
          diagnosis: d.diagnosis.trim(),
          diagnosisDate: d.diagnosisDate
        })).filter(d => d.diagnosis && d.diagnosisDate),
        
        treatments: editData.treatments.map(t => ({
          treatment: t.treatment.trim(),
          treatmentDate: t.treatmentDate,
          notes: t.notes?.trim() || ''
        })).filter(t => t.treatment && t.treatmentDate),
        
        allergies: editData.allergies.filter(a => a.trim())
      };

      if (cleanedData.treatments.length === 0 && 
          cleanedData.diagnoses.length === 0 && 
          cleanedData.allergies.length === 0) {
        setError('Please add at least one diagnosis, treatment, or allergy');
        return;
      }

      const response = await updateMedicalRecord(patientId, cleanedData);
      setMedicalRecord(response.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update medical record';
      console.error('Error updating medical record:', err);
      setError(errorMessage);
      
      // If it's a permission error, show a more specific message
      if (err.response?.status === 403) {
        setError('You do not have permission to update medical records. Only Dentists and Admins can make changes.');
      }
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
    setError('');
  };

  const handleAddDiagnosis = () => {
    setEditData(prev => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        { diagnosis: '', diagnosisDate: moment().format('YYYY-MM-DD') }
      ]
    }));
  };

  const handleAddTreatment = () => {
    setEditData(prev => ({
      ...prev,
      treatments: [
        ...prev.treatments,
        {
          treatment: '',
          treatmentDate: moment().format('YYYY-MM-DD'),
          notes: ''
        }
      ]
    }));
  };

  if (loading) return <div className="loading">Loading medical record...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="medical-record">
      <div className="section-header">
        <h2>Medical Record</h2>
        {!editMode && canEdit && (
          <button className="btn edit" onClick={handleEdit}>
            <FaEdit /> Edit Record
          </button>
        )}
        {editMode && (
          <div className="edit-actions">
            <button className="btn save" onClick={handleSave}>
              <FaSave /> Save
            </button>
            <button className="btn cancel" onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="edit-form">
          <div className="section">
            <div className="section-header">
              <h3>Diagnoses</h3>
              <button className="btn add" onClick={handleAddDiagnosis}>
                <FaPlus /> Add Diagnosis
              </button>
            </div>
            {editData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="diagnosis-item">
                <input
                  type="text"
                  value={diagnosis.diagnosis}
                  onChange={(e) => {
                    const newDiagnoses = [...editData.diagnoses];
                    newDiagnoses[index].diagnosis = e.target.value;
                    setEditData({ ...editData, diagnoses: newDiagnoses });
                  }}
                  placeholder="Enter diagnosis"
                />
                <input
                  type="date"
                  value={diagnosis.diagnosisDate}
                  onChange={(e) => {
                    const newDiagnoses = [...editData.diagnoses];
                    newDiagnoses[index].diagnosisDate = e.target.value;
                    setEditData({ ...editData, diagnoses: newDiagnoses });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Treatments</h3>
              <button className="btn add" onClick={handleAddTreatment}>
                <FaPlus /> Add Treatment
              </button>
            </div>
            {editData.treatments.map((treatment, index) => (
              <div key={index} className="treatment-item">
                <input
                  type="text"
                  value={treatment.treatment}
                  onChange={(e) => {
                    const newTreatments = [...editData.treatments];
                    newTreatments[index].treatment = e.target.value;
                    setEditData({ ...editData, treatments: newTreatments });
                  }}
                  placeholder="Enter treatment"
                />
                <input
                  type="date"
                  value={treatment.treatmentDate}
                  onChange={(e) => {
                    const newTreatments = [...editData.treatments];
                    newTreatments[index].treatmentDate = e.target.value;
                    setEditData({ ...editData, treatments: newTreatments });
                  }}
                />
                <textarea
                  value={treatment.notes}
                  onChange={(e) => {
                    const newTreatments = [...editData.treatments];
                    newTreatments[index].notes = e.target.value;
                    setEditData({ ...editData, treatments: newTreatments });
                  }}
                  placeholder="Treatment notes"
                />
              </div>
            ))}
          </div>

          <div className="section">
            <h3>Allergies</h3>
            <textarea
              value={editData.allergies.join('\n')}
              onChange={(e) => {
                setEditData({
                  ...editData,
                  allergies: e.target.value.split('\n').filter(Boolean)
                });
              }}
              placeholder="Enter allergies (one per line)"
            />
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <div className="section">
            <h3>Diagnoses</h3>
            {medicalRecord.diagnoses.length > 0 ? (
              <ul>
                {medicalRecord.diagnoses.map((diagnosis, index) => (
                  <li key={index}>
                    <span className="diagnosis">{diagnosis.diagnosis}</span>
                    <span className="date">
                      {moment(diagnosis.diagnosisDate).format('MMM D, YYYY')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No diagnoses recorded</p>
            )}
          </div>

          <div className="section">
            <h3>Treatments</h3>
            {medicalRecord.treatments.length > 0 ? (
              <ul>
                {medicalRecord.treatments.map((treatment, index) => (
                  <li key={index}>
                    <div className="treatment-header">
                      <span className="treatment">{treatment.treatment}</span>
                      <span className="date">
                        {moment(treatment.treatmentDate).format('MMM D, YYYY')}
                      </span>
                    </div>
                    {treatment.notes && (
                      <div className="notes">{treatment.notes}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No treatments recorded</p>
            )}
          </div>

          <div className="section">
            <h3>Allergies</h3>
            {medicalRecord.allergies.length > 0 ? (
              <ul className="allergies-list">
                {medicalRecord.allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No allergies recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MedicalRecord.propTypes = {
  patientId: PropTypes.string.isRequired
};

export default MedicalRecord; 