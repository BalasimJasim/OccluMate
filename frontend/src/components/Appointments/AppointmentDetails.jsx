import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointmentById, deleteAppointment } from "../../api";
import moment from "moment";
import AppointmentEditModal from "./AppointmentEditModal";
import ConfirmDialog from "../common/ConfirmDialog";
import { AuthContext } from "../context/authContext";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorMessage } from "../common/ErrorMessage";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const authorizedRoles = ["Admin", "Dentist", "Receptionist"];

  console.log("Current user role:", user?.role);
  console.log("Is Authorized?", authorizedRoles.includes(user?.role));

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentById(id);
      setAppointment(data);
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError(err.message || "Failed to fetch appointment details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(id);
      navigate("/appointments");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete appointment");
    }
  };

  const handleAppointmentUpdated = (updatedAppointment) => {
    setAppointment(updatedAppointment);
    setShowEditModal(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!appointment)
    return (
      <div className="text-center text-gray-500 py-8">
        Appointment not found
      </div>
    );

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Appointment Details
        </h1>
        {authorizedRoles.includes(user?.role) && (
          <div className="space-x-4">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              Patient Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm font-medium text-gray-500">
                Patient Name
              </div>
              <div className="text-sm text-gray-900">
                {appointment.patientName}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              Appointment Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="text-sm text-gray-900">
                {moment(appointment.date).format("MMMM D, YYYY")}
              </div>

              <div className="text-sm font-medium text-gray-500">Time</div>
              <div className="text-sm text-gray-900">
                {appointment.timeSlot}
              </div>

              <div className="text-sm font-medium text-gray-500">Type</div>
              <div className="text-sm text-gray-900 capitalize">
                {appointment.type}
              </div>

              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-500">Dentist</div>
              <div className="text-sm text-gray-900">
                {appointment.dentist?.name || "Not assigned"}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <AppointmentEditModal
          appointment={appointment}
          onClose={() => setShowEditModal(false)}
          onAppointmentUpdated={handleAppointmentUpdated}
          onDelete={() => {
            setShowEditModal(false);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
      />
    </div>
  );
};

export default AppointmentDetails;
