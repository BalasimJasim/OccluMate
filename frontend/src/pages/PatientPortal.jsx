import { useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../components/context/authContext";

const PatientPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Redirect non-patients
  if (user && user.role !== "Patient") {
    navigate("/", { replace: true });
    return null;
  }

  const isActiveRoute = (path) => {
    return location.pathname.includes(path);
  };

  const navigationItems = [
    { path: "/portal/dashboard", label: "Dashboard" },
    { path: "/portal/appointments", label: "Appointments" },
    { path: "/portal/prescriptions", label: "Prescriptions" },
    { path: "/portal/documents", label: "Documents" },
    { path: "/portal/settings", label: "Settings" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-[calc(100vh-64px)] bg-gray-100">
      <nav className="bg-white md:border-r border-gray-200 md:p-8 p-4 fixed md:static bottom-0 left-0 right-0 md:bottom-auto z-50 flex md:flex-col flex-row justify-around md:justify-start md:gap-4">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            className={`px-6 py-4 text-left rounded-md font-medium transition-all
              ${
                isActiveRoute(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="p-8 pb-24 md:pb-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientPortal;
