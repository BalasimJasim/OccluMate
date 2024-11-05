import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './components/context/authContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import PatientPortal from './pages/PatientPortal';
import PortalDashboard from './components/PatientPortal/PortalDashboard';
import PortalSettings from './components/PatientPortal/PortalSettings';
import TemplateManager from './components/Templates/TemplateManager';
import PatientForm from './components/Patients/PatientForm';
import PatientLogin from './components/Auth/PatientLogin';
import ChangePassword from './components/Auth/ChangePassword';
import AppointmentDetails from './components/Appointments/AppointmentDetails';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  console.log('Current user:', user); // Debug log

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        {/* Patient Routes */}
        <Route path="/portal" element={<PatientPortal />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<PortalDashboard patientId={user?._id} />} />
          <Route path="appointments" element={<PatientPortal activeTab="appointments" />} />
          <Route path="prescriptions" element={<PatientPortal activeTab="prescriptions" />} />
          <Route path="documents" element={<PatientPortal activeTab="documents" />} />
          <Route path="settings" element={<PortalSettings patientId={user?._id} />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/" element={
          user?.role === 'Patient' ? 
            <Navigate to="/portal/dashboard" replace /> : 
            <Home />
        } />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/register" element={<PatientForm />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/appointments/*" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route 
          path="/templates" 
          element={
            user?.role === 'Admin' ? <TemplateManager /> : <Navigate to="/" />
          }
        />
        <Route path="/dental-charts" element={<PatientDetails />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
