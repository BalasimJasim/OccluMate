import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import DentalChart from '../models/DentalChart.js';
import PatientSettings from '../models/PatientSettings.js';
import moment from 'moment';
import Prescription from '../models/Prescription.js';

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { dentistId, date, timeSlot, type } = req.body;
    const patientId = req.user._id; // Get patient ID from authenticated user

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      dentist: dentistId,
      date: moment(date).format('YYYY-MM-DD'),
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: 'This time slot is already booked' 
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      dentist: dentistId,
      date: moment(date).format('YYYY-MM-DD'),
      timeSlot,
      type,
      status: 'scheduled'
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ 
      message: 'Error booking appointment',
      error: error.message 
    });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for patient:', req.user._id);
    
    const appointments = await Appointment.find({ 
      patient: req.user._id,
      date: { $gte: new Date() }
    })
    .populate('dentist', 'name')
    .sort({ date: 1, timeSlot: 1 });

    console.log('Found appointments:', appointments);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};

// Get patient's dental chart
export const getPatientDentalChart = async (req, res) => {
  try {
    const dentalChart = await DentalChart.findOne({ patient: req.user._id });
    if (!dentalChart) {
      return res.status(404).json({ message: 'Dental chart not found' });
    }
    res.json(dentalChart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient's medical history
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findOne({ patient: req.user._id });
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical history not found' });
    }
    res.json(medicalRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient portal settings
export const getPatientSettings = async (req, res) => {
  try {
    const settings = await PatientSettings.findOne({ patient: req.user._id });
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        reminderPreferences: {
          email: true,
          sms: false,
          appointmentReminder: 24,
          prescriptionReminder: true,
          documentNotifications: true
        },
        communicationPreferences: {
          preferredMethod: 'email',
          language: 'en'
        }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient portal settings
export const updatePatientSettings = async (req, res) => {
  try {
    const settings = await PatientSettings.findOneAndUpdate(
      { patient: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const [appointments, dentalChart, medicalRecord] = await Promise.all([
      Appointment.find({ 
        patient: req.user._id,
        date: { $gte: new Date() }
      })
      .populate('dentist', 'name')
      .sort({ date: 1 })
      .limit(5),
      DentalChart.findOne({ patient: req.user._id }),
      MedicalRecord.findOne({ patient: req.user._id })
    ]);

    res.json({
      upcomingAppointments: appointments,
      dentalChart,
      medicalRecord
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    console.log('Fetching prescriptions for patient:', req.user._id);
    
    const prescriptions = await Prescription.find({ 
      patient: req.user._id 
    })
    .populate('dentist', 'name')
    .sort({ createdAt: -1 });

    console.log('Found prescriptions:', prescriptions);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ 
      message: 'Error fetching prescriptions', 
      error: error.message 
    });
  }
};
