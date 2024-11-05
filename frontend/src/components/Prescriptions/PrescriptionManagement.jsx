import React, { useState, useEffect } from 'react';
import { createPrescription, getPrescriptionsByPatient } from '../../api';

const PrescriptionManagement = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState({ medication: '', dosage: '', instructions: '' });

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const response = await getPrescriptionsByPatient(patientId);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPrescription({ ...currentPrescription, patientId });
      fetchPrescriptions();
      setCurrentPrescription({ medication: '', dosage: '', instructions: '' });
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  return (
    <div>
      <h2>Prescription Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Medication"
          value={currentPrescription.medication}
          onChange={(e) => setCurrentPrescription({ ...currentPrescription, medication: e.target.value })}
        />
        <input
          type="text"
          placeholder="Dosage"
          value={currentPrescription.dosage}
          onChange={(e) => setCurrentPrescription({ ...currentPrescription, dosage: e.target.value })}
        />
        <textarea
          placeholder="Instructions"
          value={currentPrescription.instructions}
          onChange={(e) => setCurrentPrescription({ ...currentPrescription, instructions: e.target.value })}
        />
        <button type="submit">Add Prescription</button>
      </form>
      <ul>
        {prescriptions.map((prescription) => (
          <li key={prescription._id}>
            {prescription.medication} - {prescription.dosage}
            <p>{prescription.instructions}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrescriptionManagement;
