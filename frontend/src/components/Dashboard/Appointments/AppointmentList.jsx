import { useState } from "react";
import { FaCalendarPlus, FaSearch } from "react-icons/fa";
import Button from "../../common/Button";
import Table from "../../common/Table";
import Badge from "../../common/Badge";
import Card from "../../common/Card";

const AppointmentList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const appointmentColumns = [
    {
      key: "date",
      header: "Date & Time",
      render: (row) => (
        <div>
          <div className="font-medium">{row.date}</div>
          <div className="text-gray-500 text-sm">{row.time}</div>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (row) => (
        <div>
          <div className="font-medium">{row.patient}</div>
          <div className="text-gray-500 text-sm">{row.email}</div>
        </div>
      ),
    },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" className="px-2 py-1 text-sm">
            Edit
          </Button>
          <Button variant="danger" className="px-2 py-1 text-sm">
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  const appointments = [
    {
      date: "2024-03-20",
      time: "09:00 AM",
      patient: "John Doe",
      email: "john.doe@example.com",
      type: "Check-up",
      status: "Confirmed",
      statusVariant: "success",
    },
    {
      date: "2024-03-20",
      time: "10:30 AM",
      patient: "Jane Smith",
      email: "jane.smith@example.com",
      type: "Cleaning",
      status: "Pending",
      statusVariant: "warning",
    },
    // Add more appointments as needed
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        <Button>
          <FaCalendarPlus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
              <option value="all">All Types</option>
              <option value="check-up">Check-up</option>
              <option value="cleaning">Cleaning</option>
              <option value="procedure">Procedure</option>
            </select>
          </div>
        </div>
        <Table columns={appointmentColumns} data={appointments} />
      </Card>
    </div>
  );
};

export default AppointmentList;
