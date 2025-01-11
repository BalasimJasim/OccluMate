import { useState, useEffect, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { getMedicalRecord, updateMedicalRecord } from "../../api";
import moment from "moment";
import { FaPlus, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/authContext";

const MedicalRecord = ({ patientId }) => {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Can edit:", ["Dentist", "Admin"].includes(user?.role));
  }, [user]);

  useEffect(() => {
    console.log("AuthContext state:", {
      user,
      userRole: user?.role,
      isUserDefined: !!user,
      storedUser: localStorage.getItem("user"),
      storedToken: localStorage.getItem("token"),
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Try to reload user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Reloaded user from localStorage:", parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
  }, [user]);

  const canEdit = useMemo(() => {
    const hasPermission = ["Dentist", "Admin"].includes(user?.role);
    console.log("Permission check:", {
      userRole: user?.role,
      allowedRoles: ["Dentist", "Admin"],
      hasPermission,
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
      setError("Failed to fetch medical record");
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
        diagnoses: editData.diagnoses
          .map((d) => ({
            diagnosis: d.diagnosis.trim(),
            diagnosisDate: d.diagnosisDate,
          }))
          .filter((d) => d.diagnosis && d.diagnosisDate),

        treatments: editData.treatments
          .map((t) => ({
            treatment: t.treatment.trim(),
            treatmentDate: t.treatmentDate,
            notes: t.notes?.trim() || "",
          }))
          .filter((t) => t.treatment && t.treatmentDate),

        allergies: editData.allergies.filter((a) => a.trim()),
      };

      if (
        cleanedData.treatments.length === 0 &&
        cleanedData.diagnoses.length === 0 &&
        cleanedData.allergies.length === 0
      ) {
        setError("Please add at least one diagnosis, treatment, or allergy");
        return;
      }

      const response = await updateMedicalRecord(patientId, cleanedData);
      setMedicalRecord(response.data);
      setEditMode(false);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update medical record";
      console.error("Error updating medical record:", err);
      setError(errorMessage);

      // If it's a permission error, show a more specific message
      if (err.response?.status === 403) {
        setError(
          "You do not have permission to update medical records. Only Dentists and Admins can make changes."
        );
      }
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(null);
    setError("");
  };

  const handleAddDiagnosis = () => {
    setEditData((prev) => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        { diagnosis: "", diagnosisDate: moment().format("YYYY-MM-DD") },
      ],
    }));
  };

  const handleAddTreatment = () => {
    setEditData((prev) => ({
      ...prev,
      treatments: [
        ...prev.treatments,
        {
          treatment: "",
          treatmentDate: moment().format("YYYY-MM-DD"),
          notes: "",
        },
      ],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading medical record...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Medical Record</h2>
        {!editMode && canEdit && (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleEdit}
          >
            <FaEdit className="mr-2" /> Edit Record
          </button>
        )}
        {editMode && (
          <div className="flex space-x-3">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleSave}
            >
              <FaSave className="mr-2" /> Save
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleCancel}
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Diagnoses</h3>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddDiagnosis}
              >
                <FaPlus className="mr-1.5" /> Add Diagnosis
              </button>
            </div>
            <div className="space-y-4">
              {editData.diagnoses.map((diagnosis, index) => (
                <div key={index} className="flex space-x-4">
                  <input
                    type="text"
                    value={diagnosis.diagnosis}
                    onChange={(e) => {
                      const newDiagnoses = [...editData.diagnoses];
                      newDiagnoses[index].diagnosis = e.target.value;
                      setEditData({ ...editData, diagnoses: newDiagnoses });
                    }}
                    placeholder="Enter diagnosis"
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <input
                    type="date"
                    value={diagnosis.diagnosisDate}
                    onChange={(e) => {
                      const newDiagnoses = [...editData.diagnoses];
                      newDiagnoses[index].diagnosisDate = e.target.value;
                      setEditData({ ...editData, diagnoses: newDiagnoses });
                    }}
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Treatments</h3>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddTreatment}
              >
                <FaPlus className="mr-1.5" /> Add Treatment
              </button>
            </div>
            <div className="space-y-6">
              {editData.treatments.map((treatment, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={treatment.treatment}
                      onChange={(e) => {
                        const newTreatments = [...editData.treatments];
                        newTreatments[index].treatment = e.target.value;
                        setEditData({ ...editData, treatments: newTreatments });
                      }}
                      placeholder="Enter treatment"
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <input
                      type="date"
                      value={treatment.treatmentDate}
                      onChange={(e) => {
                        const newTreatments = [...editData.treatments];
                        newTreatments[index].treatmentDate = e.target.value;
                        setEditData({ ...editData, treatments: newTreatments });
                      }}
                      className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <textarea
                    value={treatment.notes}
                    onChange={(e) => {
                      const newTreatments = [...editData.treatments];
                      newTreatments[index].notes = e.target.value;
                      setEditData({ ...editData, treatments: newTreatments });
                    }}
                    placeholder="Treatment notes"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
            <textarea
              value={editData.allergies.join("\n")}
              onChange={(e) => {
                setEditData({
                  ...editData,
                  allergies: e.target.value.split("\n").map((a) => a.trim()),
                });
              }}
              placeholder="Enter allergies (one per line)"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Diagnoses</h3>
            {medicalRecord.diagnoses.length > 0 ? (
              <div className="space-y-4">
                {medicalRecord.diagnoses.map((diagnosis, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start border-b border-gray-200 pb-4"
                  >
                    <div className="text-gray-900">{diagnosis.diagnosis}</div>
                    <div className="text-sm text-gray-500">
                      {moment(diagnosis.diagnosisDate).format("MMM D, YYYY")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No diagnoses recorded</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Treatments</h3>
            {medicalRecord.treatments.length > 0 ? (
              <div className="space-y-6">
                {medicalRecord.treatments.map((treatment, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-900">{treatment.treatment}</div>
                      <div className="text-sm text-gray-500">
                        {moment(treatment.treatmentDate).format("MMM D, YYYY")}
                      </div>
                    </div>
                    {treatment.notes && (
                      <div className="text-sm text-gray-600 mt-2">
                        {treatment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No treatments recorded</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
            {medicalRecord.allergies.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {medicalRecord.allergies.map((allergy, index) => (
                  <li key={index} className="text-gray-900">
                    {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No allergies recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MedicalRecord.propTypes = {
  patientId: PropTypes.string.isRequired,
};

export default MedicalRecord;
