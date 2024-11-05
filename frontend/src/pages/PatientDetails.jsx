import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DentalChart from '../components/Patients/DentalChart';
import { getPatientById, getDentalChart, updateDentalChart } from '../api';
import './PatientDetails.scss';
import MedicalRecord from '../components/Patients/MedicalRecord';
import FullScreenModal from '../components/common/FullScreenModal';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [dentalChart, setDentalChart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showDentalChartModal, setShowDentalChartModal] = useState(false);

  const fetchPatientData = async () => {
    try {
      console.log('Fetching data for patient ID:', id);
      
      const [patientRes, chartRes] = await Promise.all([
        getPatientById(id),
        getDentalChart(id)
      ]);

      console.log('Patient Response:', patientRes);
      console.log('Dental Chart Response:', chartRes);

      if (patientRes.data) {
        setPatient(patientRes.data);
      } else {
        setError('Patient data not found');
      }

      if (chartRes.data) {
        setDentalChart(chartRes.data?.chartData || {});
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const handleChartUpdate = async (patientId, chartData) => {
    try {
      await updateDentalChart(patientId, chartData);
      const updatedChart = await getDentalChart(patientId);
      setDentalChart(updatedChart.data?.chartData || {});
    } catch (error) {
      console.error('Error updating dental chart:', error);
    }
  };

  if (loading) return <div className="loading">Loading patient details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!patient) return <div className="error-message">Patient not found</div>;

  return (
    <div className="patient-details">
      <div className="patient-header">
        <div className="patient-info">
          <h1>{patient.name}</h1>
          <div className="patient-meta">
            <span>Email: {patient.email}</span>
            <span>Phone: {patient.phone}</span>
            <span>Age: {patient.age}</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Basic Info
        </button>
        <button
          className={`tab ${activeTab === 'dental-chart' ? 'active' : ''}`}
          onClick={() => setShowDentalChartModal(true)}
        >
          Dental Chart
        </button>
        <button
          className={`tab ${activeTab === 'medical-record' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical-record')}
        >
          Medical Record
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-section">
            <h3>Contact Information</h3>
            <p><strong>Address:</strong> {patient.address.street}, {patient.address.city}, {patient.address.zip}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
          </div>
        )}

        {activeTab === 'medical-record' && (
          <MedicalRecord patientId={id} />
        )}
      </div>

      <FullScreenModal
        isOpen={showDentalChartModal}
        onClose={() => setShowDentalChartModal(false)}
        title="Dental Chart"
      >
        <DentalChart
          patientId={id}
          initialData={dentalChart}
          onUpdate={handleChartUpdate}
        />
      </FullScreenModal>
    </div>
  );
};

export default PatientDetails;
