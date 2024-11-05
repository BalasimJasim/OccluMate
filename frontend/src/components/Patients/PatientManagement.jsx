import React, { useState, useEffect } from 'react';
import { addPatient, getAllPatients, updatePatient, deletePatient } from '../../api';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState({ name: '', email: '', phone: '', address: { street: '', city: '', zip: '' }, age: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getAllPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updatePatient(currentPatient._id, currentPatient);
      } else {
        await addPatient(currentPatient);
      }
      fetchPatients();
      setCurrentPatient({ name: '', email: '', phone: '', address: { street: '', city: '', zip: '' }, age: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  return (
    <div className="patient-management">
      <h2>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={currentPatient.name}
            onChange={(e) => setCurrentPatient({ ...currentPatient, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={currentPatient.email}
            onChange={(e) => setCurrentPatient({ ...currentPatient, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={currentPatient.phone}
            onChange={(e) => setCurrentPatient({ ...currentPatient, phone: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="street">Street</label>
          <input
            id="street"
            type="text"
            value={currentPatient.address.street}
            onChange={(e) => setCurrentPatient({ ...currentPatient, address: { ...currentPatient.address, street: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={currentPatient.address.city}
            onChange={(e) => setCurrentPatient({ ...currentPatient, address: { ...currentPatient.address, city: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="zip">Zip Code</label>
          <input
            id="zip"
            type="text"
            value={currentPatient.address.zip}
            onChange={(e) => setCurrentPatient({ ...currentPatient, address: { ...currentPatient.address, zip: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            value={currentPatient.age}
            onChange={(e) => setCurrentPatient({ ...currentPatient, age: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Add'} Patient</button>
        {isEditing && <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>}
      </form>
      <h2>Patient List</h2>
      <ul className="patient-list">
        {patients.map((patient) => (
          <li key={patient._id} className="patient-item">
            <div>
              <strong>{patient.name}</strong> - {patient.email}
            </div>
            <div>
              <button onClick={() => handleEdit(patient)} className="btn btn-secondary">Edit</button>
              <button onClick={() => handleDelete(patient._id)} className="btn btn-danger">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientManagement;
