import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PatientList from '../components/Patients/PatientList';
import PatientForm from '../components/Patients/PatientForm';
import '../styles/pages/_patients.scss';

const Patients = () => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(location.state?.showAddForm || false);

  return (
    <div className="patients-page">
      {showAddForm ? (
        <PatientForm onClose={() => setShowAddForm(false)} />
      ) : (
        <PatientList onAddNew={() => setShowAddForm(true)} />
      )}
    </div>
  );
};

export default Patients;
