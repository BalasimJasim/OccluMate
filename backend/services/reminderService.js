import cron from 'node-cron';
import Reminder from '../models/Reminder.js';
import { sendReminderEmail } from '../utils/sendEmail.js';
import { sendSMS } from '../utils/sendSMS.js';
import moment from 'moment';

// Function to get upcoming reminders and send them
const processReminders = async () => {
  try {
    console.log('Processing reminders...'); // Debug log

    // Get reminders that need to be sent (pending and within the next hour)
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const pendingReminders = await Reminder.find({
      status: 'pending',
      sendDate: {
        $gte: now,
        $lte: oneHourFromNow
      },
      retries: { $lt: 3 }
    }).populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'appointment', populate: { path: 'dentist', select: 'name' } }
    ]);

    console.log(`Found ${pendingReminders.length} reminders to process`); // Debug log

    for (const reminder of pendingReminders) {
      try {
        // Prepare reminder data
        const reminderData = {
          patientName: reminder.patient.name,
          appointmentDate: moment(reminder.appointment.date).format('MMMM D, YYYY'),
          appointmentTime: reminder.appointment.timeSlot,
          dentistName: reminder.appointment.dentist.name,
          type: reminder.appointment.type,
          message: reminder.message,
          clinicPhone: process.env.CLINIC_PHONE,
          clinicEmail: process.env.CLINIC_EMAIL
        };

        // Send reminders based on method preference
        if (reminder.method === 'email' || reminder.method === 'both') {
          await sendReminderEmail(reminder.patient.email, reminderData);
        }

        if (reminder.method === 'sms' || reminder.method === 'both') {
          await sendSMS(reminder.patient.phone, reminderData);
        }

        // Update reminder status
        reminder.status = 'sent';
        reminder.lastAttempt = new Date();
        await reminder.save();

        console.log(`Reminder sent successfully to ${reminder.patient.name}`); // Debug log
      } catch (error) {
        console.error(`Error processing reminder ${reminder._id}:`, error);
        
        // Update retry count and status
        reminder.retries += 1;
        reminder.lastAttempt = new Date();
        
        if (reminder.retries >= 3) {
          reminder.status = 'failed';
        }
        
        await reminder.save();
      }
    }
  } catch (error) {
    console.error('Error in reminder processing:', error);
  }
};

// Function to create appointment reminders
export const createAppointmentReminders = async (appointment) => {
  try {
    // Create 24-hour reminder
    await Reminder.create({
      patient: appointment.patient,
      appointment: appointment._id,
      type: 'appointment',
      message: 'Your appointment is tomorrow',
      sendDate: moment(appointment.date).subtract(24, 'hours').toDate(),
      method: 'both'
    });

    // Create 2-hour reminder
    await Reminder.create({
      patient: appointment.patient,
      appointment: appointment._id,
      type: 'appointment',
      message: 'Your appointment is in 2 hours',
      sendDate: moment(appointment.date).subtract(2, 'hours').toDate(),
      method: 'sms'
    });

    console.log('Appointment reminders created successfully');
  } catch (error) {
    console.error('Error creating appointment reminders:', error);
    throw error;
  }
};

// Start the reminder service
export const startReminderService = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running reminder check...');
    await processReminders();
  });

  // Clean up old reminders once a day
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
      await Reminder.deleteMany({
        status: { $in: ['sent', 'failed'] },
        sendDate: { $lt: thirtyDaysAgo }
      });
      console.log('Old reminders cleaned up');
    } catch (error) {
      console.error('Error cleaning up old reminders:', error);
    }
  });
};

export const sendAppointmentReminder = async (appointment) => {
  try {
    if (appointment.patient.phone) {
      await sendSMS(appointment.patient.phone, {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        dentistName: appointment.dentist.name,
        cabinet: appointment.cabinet,
        message: 'Reminder: You have an upcoming dental appointment'
      });
      console.log('Reminder SMS sent successfully');
    }
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
  }
};

export const scheduleReminders = async () => {
  // Add your reminder scheduling logic here
  // This could be run daily to send reminders for upcoming appointments
};