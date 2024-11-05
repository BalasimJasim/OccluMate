import Reminder from '../models/Reminder.js';
import moment from 'moment';

// Create a new reminder
export const createReminder = async (req, res) => {
  try {
    const { patient, appointment, type, message, sendDate, method } = req.body;

    // Validate send date is in the future
    if (moment(sendDate).isBefore(moment())) {
      return res.status(400).json({
        message: 'Reminder send date must be in the future'
      });
    }

    const reminder = new Reminder({
      patient,
      appointment,
      type,
      message,
      sendDate,
      method
    });

    const savedReminder = await reminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ 
      message: 'Error creating reminder',
      error: error.message 
    });
  }
};

// Get pending reminders that need to be sent
export const getPendingReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      status: 'pending',
      sendDate: { $lte: now },
      retries: { $lt: 3 } // Only get reminders that haven't exceeded retry limit
    })
    .populate('patient', 'name email phone')
    .populate('appointment', 'date timeSlot type');

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({ 
      message: 'Error fetching pending reminders',
      error: error.message 
    });
  }
};

// Update reminder status
export const updateReminderStatus = async (req, res) => {
  try {
    const { status, response } = req.body;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.status = status;
    if (response) {
      reminder.response = response;
      reminder.responseDate = new Date();
    }
    if (status === 'failed') {
      reminder.retries += 1;
    }
    reminder.lastAttempt = new Date();

    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ 
      message: 'Error updating reminder status',
      error: error.message 
    });
  }
};

// Get reminders for a specific patient
export const getPatientReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ patient: req.params.patientId })
      .populate('appointment', 'date timeSlot type')
      .sort({ sendDate: -1 });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching patient reminders:', error);
    res.status(500).json({ 
      message: 'Error fetching patient reminders',
      error: error.message 
    });
  }
};

// Delete a reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Only allow deletion of pending reminders
    if (reminder.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending reminders can be deleted' 
      });
    }

    await reminder.remove();
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ 
      message: 'Error deleting reminder',
      error: error.message 
    });
  }
};

// Bulk create reminders for appointments
export const createAppointmentReminders = async (req, res) => {
  try {
    const { appointmentId, reminders } = req.body;

    const createdReminders = await Promise.all(
      reminders.map(async (reminder) => {
        const newReminder = new Reminder({
          ...reminder,
          appointment: appointmentId,
          type: 'appointment'
        });
        return await newReminder.save();
      })
    );

    res.status(201).json(createdReminders);
  } catch (error) {
    console.error('Error creating appointment reminders:', error);
    res.status(500).json({ 
      message: 'Error creating appointment reminders',
      error: error.message 
    });
  }
}; 