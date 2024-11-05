
import Appointment from '../models/Appointment.js';
import Task from '../models/Task.js';
import MedicalRecord from '../models/MedicalRecord.js';

// Get appointment stats (e.g., total scheduled, completed, and cancelled)
export const getAppointmentStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

    res.json({
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient treatment stats
export const getTreatmentStats = async (req, res) => {
  try {
    const treatmentCount = await MedicalRecord.aggregate([
      { $unwind: '$treatments' },
      { $group: { _id: null, totalTreatments: { $sum: 1 } } },
    ]);

    res.json(treatmentCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task completion stats for staff
export const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
