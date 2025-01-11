import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  function (config) {
    console.log("[API] Making request to:", config.url);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("[API] Response received:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("[API] Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log("[API] Unauthorized, clearing token");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject({
        message: "Session expired. Please login again.",
      });
    }

    if (error.code === "ERR_NETWORK" && error.message.includes("CORS")) {
      console.error("[API] CORS error:", error);
      return Promise.reject({
        message: "Unable to connect to the server. CORS error.",
      });
    }

    if (error.code === "ERR_NETWORK") {
      console.error("[API] Network error:", error);
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
      });
    }

    if (error.code === "ECONNABORTED") {
      console.error("[API] Request timeout:", error);
      return Promise.reject({
        message: "Request timed out. Please try again.",
      });
    }

    return Promise.reject(
      error.response?.data || {
        message: "An unexpected error occurred.",
      }
    );
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
