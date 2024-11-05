import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const PatientForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { 
      street: "", 
      city: "", 
      zip: "" 
    },
    age: "",
    medicalHistory: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const patientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: Number(formData.age),
        medicalHistory: formData.medicalHistory
      };

      const response = await api.post("/patients", patientData);

      if (response.data.success) {
        const message = `
          Patient added successfully!
          
          Portal Access Details:
          Email: ${formData.email}
          Temporary Password: ${response.data.temporaryPassword}
          
          Please provide these credentials to the patient.
        `;
        alert(message);
        navigate(`/patients/${response.data.data._id}`);
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err.response?.data?.message || "Error adding patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-form">
      <h2>Add New Patient</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>

        <div className="address-fields">
          <label htmlFor="street">Street Address</label>
          <input
            type="text"
            id="street"
            value={formData.address.street}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, street: e.target.value }
            })}
            required
          />
        </div>

        <div className="address-fields">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            value={formData.address.city}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, city: e.target.value }
            })}
            required
          />
        </div>

        <div className="address-fields">
          <label htmlFor="zip">ZIP Code</label>
          <input
            type="text"
            id="zip"
            value={formData.address.zip}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, zip: e.target.value }
            })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalHistory">Medical History</label>
          <textarea
            id="medicalHistory"
            value={formData.medicalHistory}
            onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? "Adding Patient..." : "Add Patient"}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
