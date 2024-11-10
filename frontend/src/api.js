import axios from 'axios';
import moment from 'moment';


const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("API URL:", process.env.REACT_APP_API_URL);

// Add request interceptor for logging and token handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.config.method.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    console.error("[API Response Error]", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Format error message for frontend
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    error.userMessage = errorMessage;
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

// Staff/Dentist Appointment APIs
export const addAppointment = async (appointmentData) => {
  try {
    console.log("[addAppointment] Sending data:", appointmentData);
    const response = await api.post("/appointments", appointmentData);
    console.log("[addAppointment] Success:", response.data);

    // Ensure the response includes all necessary data
    const appointment = response.data;

    // Format dates for the calendar
    return {
      ...response,
      data: {
        ...appointment,
        start: new Date(`${appointment.date}T${appointment.timeSlot}`),
        end: new Date(`${appointment.date}T${appointment.timeSlot}`),
        title: `${appointment.patientName} - ${appointment.type}`,
      },
    };
  } catch (error) {
    console.error(
      "[addAppointment] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getAllAppointments = async () => {
  try {
    console.log("[getAllAppointments] Fetching appointments");
    const response = await api.get("/appointments");
    console.log("[getAllAppointments] Raw response:", response.data);

    // Return the data directly since it's already an array
    return response.data;
  } catch (error) {
    console.error(
      "[getAllAppointments] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const updateAppointment = async (id, data) => {
  try {
    console.log("[updateAppointment] Updating appointment:", { id, data });
    const response = await api.put(`/appointments/${id}`, data);
    console.log("[updateAppointment] Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[updateAppointment] Error:", {
      appointmentId: id,
      data,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};
export const deleteAppointment = async (id) => {
  try {
    console.log("[deleteAppointment] Deleting appointment:", id);
    const response = await api.delete(`/appointments/${id}`);
    console.log("[deleteAppointment] Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[deleteAppointment] Error:", {
      appointmentId: id,
      error: error.response?.data || error.message,
    });
    if (error.response?.status === 403) {
      throw new Error("You do not have permission to delete appointments");
    }
    throw error;
  }
};
export const checkDentistAvailability = async ({
  dentistId,
  date,
  timeSlot,
  patientId,
}) => {
  console.log("[checkDentistAvailability] Checking with params:", {
    dentistId,
    date,
    timeSlot,
    patientId,
  });
  const response = await api.get("/appointments/check-availability", {
    params: { dentistId, date, timeSlot, patientId },
  });
  console.log("[checkDentistAvailability] Success:", response.data);
  return response;
};
export const getUpcomingAppointments = () => api.get("/appointments/upcoming");
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status });

// Patient Portal Appointment APIs
export const bookAppointment = (appointmentData) =>
  api.post("/patient-portal/appointments", appointmentData);
export const getPatientAppointments = () =>
  api.get("/patient-portal/appointments");
export const getPatientPrescriptions = () =>
  api.get("/patient-portal/prescriptions");

// Task APIs
export const getTodaysTasks = () => api.get("/tasks/today");
export const getTasksByUser = (userId) => api.get(`/tasks/user/${userId}`);
export const createTask = (taskData) => api.post("/tasks", taskData);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Dentist APIs
export const getAllDentists = () => api.get("/users/dentists");

// Medical Record APIs
export const getMedicalRecord = (patientId) =>
  api.get(`/medical-records/${patientId}`);
export const updateMedicalRecord = (patientId, data) =>
  api.put(`/medical-records/${patientId}`, data);

// Dental Chart APIs
export const getDentalChart = async (patientId) => {
  console.log("Fetching dental chart for patient ID:", patientId); // Debug log
  try {
    const response = await api.get(`/dental-charts/${patientId}`);
    console.log("Dental chart response:", response.data); // Debug log
    return response;
  } catch (error) {
    console.error("Error fetching dental chart:", error);
    throw error;
  }
};
export const updateDentalChart = (patientId, chartData) =>
  api.put(`/dental-charts/${patientId}`, { chartData });

// Patient Portal APIs
export const getPatientPortalData = () => api.get("/patient-portal/dashboard");
export const getPatientSettings = () => api.get("/patient-portal/settings");
export const updatePatientSettings = (patientId, settings) =>
  api.put(`/patient-portal/settings/${patientId}`, settings);

// Template APIs
export const createTemplate = (templateData) =>
  api.post("/templates", templateData);
export const getTemplates = () => api.get("/templates");
export const getTemplateById = (id) => api.get(`/templates/${id}`);
export const updateTemplate = (id, templateData) =>
  api.put(`/templates/${id}`, templateData);
export const deleteTemplate = (id) => api.delete(`/templates/${id}`);

// Analytics APIs
export const getAppointmentStats = () => api.get("/analytics/appointments");
export const getTreatmentStats = () => api.get("/analytics/treatments");
export const getTaskStats = () => api.get("/analytics/tasks");

// Prescription APIs
export const createPrescription = (prescriptionData) =>
  api.post("/prescriptions", prescriptionData);
export const getPrescriptionsByPatient = (patientId) =>
  api.get(`/prescriptions/patient/${patientId}`);

// Add this new function
export const getTodayAppointments = async () => {
  try {
    console.log("[getTodayAppointments] Fetching today's appointments");
    const response = await api.get("/appointments/today");
    console.log("[getTodayAppointments] Success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "[getTodayAppointments] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAppointmentById = async (id) => {
  try {
    console.log("[getAppointmentById] Fetching appointment:", id);
    const response = await api.get(`/appointments/${id}`);
    console.log("[getAppointmentById] Success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "[getAppointmentById] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export default api;
