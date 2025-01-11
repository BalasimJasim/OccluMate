import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (credentials) => api.post("/auth/login", credentials);
export const register = (userData) => api.post("/auth/register", userData);
export const patientLogin = (credentials) =>
  api.post("/auth/patient-login", credentials);

// Patient APIs
export const getAllPatients = () => api.get("/patients");
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const addPatient = (patientData) => api.post("/patients", patientData);
export const updatePatient = (id, patientData) =>
  api.put(`/patients/${id}`, patientData);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// Staff APIs
export const getAllStaff = () => api.get("/staff");
export const getAllDentists = () => api.get("/staff?role=Dentist");
export const addStaffMember = (staffData) => api.post("/staff", staffData);
export const updateStaffMember = (id, staffData) =>
  api.put(`/staff/${id}`, staffData);
export const deleteStaffMember = (id) => api.delete(`/staff/${id}`);

// Appointment APIs
export const getAllAppointments = () => api.get("/appointments");
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const addAppointment = (appointmentData) =>
  api.post("/appointments", appointmentData);
export const updateAppointment = (id, appointmentData) =>
  api.put(`/appointments/${id}`, appointmentData);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const checkDentistAvailability = (dentistId, date) =>
  api.get(`/appointments/check-availability`, { params: { dentistId, date } });

export default api;
