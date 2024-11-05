import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

export const notifyAppointmentCreated = async (appointment) => {
  try {
    // Notify patient
    await sendEmail({
      to: appointment.patient.email,
      subject: 'Appointment Confirmation',
      template: 'appointment-confirmation',
      data: {
        patientName: appointment.patientName,
        dentistName: appointment.dentist.name,
        date: appointment.date,
        time: appointment.timeSlot,
        cabinet: appointment.cabinet
      }
    });

    // Notify dentist
    await sendEmail({
      to: appointment.dentist.email,
      subject: 'New Appointment Scheduled',
      template: 'appointment-notification',
      data: {
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.timeSlot,
        cabinet: appointment.cabinet
      }
    });

    // Send SMS if phone number exists
    if (appointment.patient.phone) {
      await sendSMS(appointment.patient.phone, {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        dentistName: appointment.dentist.name,
        cabinet: appointment.cabinet
      });
    }

    console.log('Appointment notifications sent successfully');
  } catch (error) {
    console.error('Error sending appointment notifications:', error);
    // Don't throw error to prevent blocking the appointment creation
  }
};

export const notifyAppointmentUpdated = async (appointment, changes) => {
  try {
    await sendEmail({
      to: appointment.patient.email,
      subject: 'Appointment Updated',
      template: 'appointment-update',
      data: {
        patientName: appointment.patientName,
        dentistName: appointment.dentist.name,
        date: appointment.date,
        time: appointment.timeSlot,
        cabinet: appointment.cabinet,
        changes
      }
    });

    // Add SMS notification
    if (appointment.patient.phone) {
      await sendSMS(appointment.patient.phone, {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        dentistName: appointment.dentist.name,
        cabinet: appointment.cabinet,
        message: 'Your appointment has been updated'
      });
    }

    console.log('Appointment update notification sent');
  } catch (error) {
    console.error('Error sending appointment update notification:', error);
  }
};

export const notifyAppointmentCancelled = async (appointment) => {
  try {
    // Notify patient
    await sendEmail({
      to: appointment.patient.email,
      subject: 'Appointment Cancelled',
      template: 'appointment-cancellation',
      data: {
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.timeSlot
      }
    });

    // Notify dentist
    await sendEmail({
      to: appointment.dentist.email,
      subject: 'Appointment Cancelled',
      template: 'appointment-cancellation-staff',
      data: {
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.timeSlot,
        cabinet: appointment.cabinet
      }
    });

    // Add SMS notification
    if (appointment.patient.phone) {
      await sendSMS(appointment.patient.phone, {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        dentistName: appointment.dentist.name,
        cabinet: appointment.cabinet,
        message: 'Your appointment has been cancelled'
      });
    }

    console.log('Cancellation notifications sent successfully');
  } catch (error) {
    console.error('Error sending cancellation notifications:', error);
  }
}; 