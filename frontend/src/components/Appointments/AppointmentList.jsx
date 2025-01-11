import { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import AppointmentEditModal from "./AppointmentEditModal";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteAppointment } from "../../api";

const AppointmentList = ({
  appointments = [],
  onAppointmentUpdated,
  onAppointmentDeleted,
}) => {
  const [editModal, setEditModal] = useState({
    show: false,
    appointment: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    appointment: null,
  });
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      await deleteAppointment(deleteConfirm.appointment._id);
      onAppointmentDeleted(deleteConfirm.appointment._id);
      setDeleteConfirm({ show: false, appointment: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete appointment");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (appointment) => {
    setEditModal({ show: true, appointment });
  };

  const handleAppointmentUpdate = (updatedAppointment) => {
    onAppointmentUpdated(updatedAppointment);
    setEditModal({ show: false, appointment: null });
  };

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-200">
        <div>Date & Time</div>
        <div>Patient</div>
        <div>Type</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {appointments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50"
            >
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  {moment(appointment.date).format("MMM DD, YYYY")}
                </div>
                <div className="text-sm text-gray-500">
                  {appointment.timeSlot}
                </div>
              </div>

              <div className="text-sm text-gray-900 self-center">
                {appointment.patientName}
              </div>

              <div className="text-sm text-gray-900 self-center capitalize">
                {appointment.type}
              </div>

              <div className="self-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="space-x-3 self-center">
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => handleEdit(appointment)}
                >
                  Edit
                </button>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => setDeleteConfirm({ show: true, appointment })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal.show && (
        <AppointmentEditModal
          appointment={editModal.appointment}
          onClose={() => setEditModal({ show: false, appointment: null })}
          onAppointmentUpdated={handleAppointmentUpdate}
          onDelete={() => {
            setEditModal({ show: false, appointment: null });
            setDeleteConfirm({
              show: true,
              appointment: editModal.appointment,
            });
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, appointment: null })}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${deleteConfirm.appointment?.patientName}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

AppointmentList.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      patientName: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      timeSlot: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAppointmentUpdated: PropTypes.func.isRequired,
  onAppointmentDeleted: PropTypes.func.isRequired,
};

export default AppointmentList;
