import {
  FaCalendarCheck,
  FaClipboardList,
  FaUserMd,
  FaClock,
} from "react-icons/fa";
import Stat from "../common/Stat";
import Table from "../common/Table";
import Badge from "../common/Badge";

const DashboardHome = () => {
  const stats = [
    {
      title: "Today's Appointments",
      value: "8",
      icon: FaCalendarCheck,
      variant: "primary",
    },
    {
      title: "Pending Tasks",
      value: "12",
      icon: FaClipboardList,
      variant: "warning",
    },
    {
      title: "Total Patients",
      value: "145",
      icon: FaUserMd,
      variant: "success",
    },
    {
      title: "Average Wait Time",
      value: "18m",
      icon: FaClock,
      variant: "info",
    },
  ];

  const appointmentColumns = [
    { key: "time", header: "Time" },
    { key: "patient", header: "Patient" },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
    },
  ];

  const appointments = [
    {
      time: "09:00 AM",
      patient: "John Doe",
      type: "Check-up",
      status: "Confirmed",
      statusVariant: "success",
    },
    // Add more appointments...
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Stat
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Today's Appointments
          </h2>
        </div>
        <Table columns={appointmentColumns} data={appointments} />
      </div>
    </div>
  );
};

export default DashboardHome;
