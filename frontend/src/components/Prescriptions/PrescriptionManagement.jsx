import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { createPrescription, getPrescriptionsByPatient } from "../../api";
import { FaPrescriptionBottle, FaPlus } from "react-icons/fa";

const PrescriptionManagement = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getPrescriptionsByPatient(patientId);
      setPrescriptions(response.data);
    } catch (error) {
      setError("Failed to fetch prescriptions");
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createPrescription({ ...currentPrescription, patientId });
      fetchPrescriptions();
      setCurrentPrescription({ medication: "", dosage: "", instructions: "" });
    } catch (error) {
      setError("Failed to create prescription");
      console.error("Error creating prescription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading prescriptions...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Prescription Management
      </h2>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label
            htmlFor="medication"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Medication
          </label>
          <input
            id="medication"
            type="text"
            placeholder="Enter medication name"
            value={currentPrescription.medication}
            onChange={(e) =>
              setCurrentPrescription({
                ...currentPrescription,
                medication: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="dosage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dosage
          </label>
          <input
            id="dosage"
            type="text"
            placeholder="Enter dosage"
            value={currentPrescription.dosage}
            onChange={(e) =>
              setCurrentPrescription({
                ...currentPrescription,
                dosage: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            placeholder="Enter instructions"
            value={currentPrescription.instructions}
            onChange={(e) =>
              setCurrentPrescription({
                ...currentPrescription,
                instructions: e.target.value,
              })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            <FaPlus className="mr-2" />
            Add Prescription
          </button>
        </div>
      </form>

      {prescriptions.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No prescriptions found</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {prescriptions.map((prescription) => (
            <li key={prescription._id} className="py-4">
              <div className="flex items-start space-x-3">
                <FaPrescriptionBottle className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1" />
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {prescription.medication}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {prescription.dosage}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {prescription.instructions}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

PrescriptionManagement.propTypes = {
  patientId: PropTypes.string.isRequired,
};

export default PrescriptionManagement;
