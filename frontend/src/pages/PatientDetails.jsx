import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DentalChart from "../components/Patients/DentalChart";
import { getPatientById, getDentalChart, updateDentalChart } from "../api";
import MedicalRecord from "../components/Patients/MedicalRecord";
import FullScreenModal from "../components/common/FullScreenModal";

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [dentalChart, setDentalChart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [showDentalChartModal, setShowDentalChartModal] = useState(false);

  const fetchPatientData = async () => {
    try {
      console.log("Fetching data for patient ID:", id);

      const [patientRes, chartRes] = await Promise.all([
        getPatientById(id),
        getDentalChart(id),
      ]);

      console.log("Patient Response:", patientRes);
      console.log("Dental Chart Response:", chartRes);

      if (patientRes.data) {
        setPatient(patientRes.data);
      } else {
        setError("Patient data not found");
      }

      if (chartRes.data) {
        setDentalChart(chartRes.data?.chartData || {});
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError("Failed to load patient data");
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
      console.error("Error updating dental chart:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 text-gray-600">
        Loading patient details...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-red-50 text-red-600 rounded-md">
        {error}
      </div>
    );
  if (!patient)
    return (
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-red-50 text-red-600 rounded-md">
        Patient not found
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {patient.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Email: {patient.email}</span>
            <span className="border-l border-gray-300 pl-4">
              Phone: {patient.phone}
            </span>
            <span className="border-l border-gray-300 pl-4">
              Age: {patient.age}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: "info", label: "Basic Info" },
            { id: "dental-chart", label: "Dental Chart" },
            { id: "medical-record", label: "Medical Record" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                tab.id === "dental-chart"
                  ? setShowDentalChartModal(true)
                  : setActiveTab(tab.id)
              }
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">Address:</span>{" "}
                  {patient.address.street}, {patient.address.city},{" "}
                  {patient.address.zip}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Email:</span>{" "}
                  {patient.email}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Phone:</span>{" "}
                  {patient.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medical-record" && <MedicalRecord patientId={id} />}
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
