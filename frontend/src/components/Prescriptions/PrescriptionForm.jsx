import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../context/authContext";
import { createPrescription, getPatientById, getPharmacies } from "../../api";
import { FaPlus, FaTrash } from "react-icons/fa";

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
];

const DURATIONS = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "30 days",
  "60 days",
  "90 days",
];

const PrescriptionForm = ({ patientId, onClose, onPrescriptionCreated }) => {
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [formData, setFormData] = useState({
    medications: [
      {
        name: "",
        dosage: "",
        frequency: FREQUENCIES[0],
        duration: DURATIONS[0],
        instructions: "",
      },
    ],
    pharmacyId: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatientData();
    fetchPharmacies();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const data = await getPatientById(patientId);
      setPatient(data);
    } catch (err) {
      setError("Failed to fetch patient data");
    }
  };

  const fetchPharmacies = async () => {
    try {
      const data = await getPharmacies();
      setPharmacies(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, pharmacyId: data[0].id }));
      }
    } catch (err) {
      setError("Failed to fetch pharmacies");
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData((prev) => ({ ...prev, medications: newMedications }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: "",
          dosage: "",
          frequency: FREQUENCIES[0],
          duration: DURATIONS[0],
          instructions: "",
        },
      ],
    }));
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, medications: newMedications }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const prescriptionData = {
        ...formData,
        patientId,
        dentistId: user.id,
        date: new Date().toISOString(),
      };

      await createPrescription(prescriptionData);
      onPrescriptionCreated();
      onClose();
    } catch (err) {
      setError("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        New Prescription for {patient.name}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.medications.map((medication, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-700">
                Medication {index + 1}
              </h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) =>
                    handleMedicationChange(index, "name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dosage
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) =>
                    handleMedicationChange(index, "dosage", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <select
                  value={medication.frequency}
                  onChange={(e) =>
                    handleMedicationChange(index, "frequency", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <select
                  value={medication.duration}
                  onChange={(e) =>
                    handleMedicationChange(index, "duration", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {DURATIONS.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Special Instructions
                </label>
                <textarea
                  value={medication.instructions}
                  onChange={(e) =>
                    handleMedicationChange(
                      index,
                      "instructions",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMedication}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Add Medication
        </button>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pharmacy
            </label>
            <select
              value={formData.pharmacyId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pharmacyId: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name} - {pharmacy.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
};

PrescriptionForm.propTypes = {
  patientId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrescriptionCreated: PropTypes.func.isRequired,
};

export default PrescriptionForm; 