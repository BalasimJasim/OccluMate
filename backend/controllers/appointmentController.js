import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import moment from 'moment';
import { notifyAppointmentCreated, notifyAppointmentUpdated, notifyAppointmentCancelled } from '../services/notificationService.js';
import sendSMS from '../utils/sendSMS.js';

// Add an appointment
export const addAppointment = async (req, res) => {
  try {
    const { patientId, dentistId, date, timeSlot, type, notes, cabinet } = req.body;
    console.log('Creating appointment with data:', req.body);

    // Validate required fields
    if (!patientId || !dentistId || !date || !timeSlot || !cabinet) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['patientId', 'dentistId', 'date', 'timeSlot', 'cabinet'],
        received: req.body
      });
    }

    // Check for conflicts
    const conflict = await Appointment.checkConflicts({
      date,
      timeSlot,
      patientId,
      cabinet
    });

    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflict.message
      });
    }

    // Fetch patient details
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch dentist details
    const dentist = await User.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const appointment = new Appointment({
      patient: patientId,
      patientName: patient.name,
      dentist: dentistId,
      dentistName: dentist.name,
      date,
      timeSlot,
      type: type || 'checkup',
      notes,
      cabinet,
      status: 'scheduled'
    });

    const savedAppointment = await appointment.save();

    // Populate the saved appointment with patient and dentist details
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('patient', 'name email')
      .populate('dentist', 'name email');

    console.log('Appointment created successfully:', populatedAppointment);

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
};

// Get all appointments with availability info
export const getAllAppointments = async (req, res) => {
  try {
    console.log('Fetching all appointments...');
    
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('dentist', 'name email')
      .sort({ date: 1, timeSlot: 1 });
    
    console.log(`Found ${appointments.length} appointments`);

    // Format the appointments to ensure consistent date format
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      patientName: apt.patientName,
      patientId: apt.patient?._id,
      dentistId: apt.dentist?._id,
      dentistName: apt.dentist?.name,
      date: moment(apt.date).format('YYYY-MM-DD'), // Ensure consistent date format
      timeSlot: apt.timeSlot,
      type: apt.type,
      status: apt.status,
      cabinet: apt.cabinet,
      notes: apt.notes,
      createdAt: apt.createdAt
    }));

    // Send the formatted array directly
    res.json(formattedAppointments);

  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments',
      error: error.message 
    });
  }
};

// Get appointments by patient ID
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate('dentist', 'name')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Update appointment status (e.g., Completed, Cancelled)
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.status = status;
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Use findByIdAndDelete instead of remove()
    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting appointment',
      error: error.message 
    });
  }
};

export const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Fetching upcoming appointments for dentist:', req.user._id);

    // If user is a dentist, get their appointments
    // If user is an admin, get all appointments
    const query = req.user.role === 'Dentist' 
      ? { dentist: req.user._id, date: { $gte: today } }
      : { date: { $gte: today } };

    const appointments = await Appointment.find(query)
      .populate('patient', 'name')
      .populate('dentist', 'name')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    // Format appointments for frontend
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      patientName: apt.patient?.name || apt.patientName,
      dentistName: apt.dentist?.name || 'Not assigned',
      date: apt.date,
      timeSlot: apt.timeSlot,
      type: apt.type,
      status: apt.status,
      notes: apt.notes || ''
    }));

    console.log('Found upcoming appointments:', formattedAppointments.length);
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching upcoming appointments', 
      error: error.message 
    });
  }
};

export const getAppointmentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.userId,
      date: { $lt: new Date() }
    }).populate('dentist', 'name').sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment history', error: error.message });
  }
};

// Check dentist availability for a specific date and time slot
export const checkAvailability = async (req, res) => {
  try {
    const { dentistId, date, timeSlot, patientId } = req.query;
    
    // Get all appointments for the specified date
    const appointments = await Appointment.find({
      date: date,
      status: { $ne: 'cancelled' }
    });

    // Get booked slots for all cabinets
    const bookedSlots = appointments.map(apt => ({
      timeSlot: apt.timeSlot,
      cabinet: apt.cabinet,
      dentistId: apt.dentist.toString(),
      patientId: apt.patient.toString()
    }));

    // Only check patient conflicts if patientId is provided
    if (patientId && timeSlot) {
      const patientConflicts = appointments.filter(apt => 
        apt.timeSlot === timeSlot && 
        apt.patient.toString() === patientId
      );

      if (patientConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Patient already has an appointment at this time'
        });
      }
    }

    // Get available time slots (excluding booked ones)
    const allTimeSlots = generateTimeSlots(); // Your existing time slots generation
    const availableSlots = allTimeSlots.filter(slot => {
      const conflictingBookings = bookedSlots.filter(booking => 
        booking.timeSlot === slot
      );
      
      // If all cabinets are booked for this slot, it's not available
      return conflictingBookings.length < TOTAL_CABINETS;
    });

    // Get available cabinets for the specific time slot
    const availableCabinets = timeSlot ? CABINET_LIST.filter(cabinet => {
      const cabinetBooked = bookedSlots.some(booking => 
        booking.timeSlot === timeSlot && 
        booking.cabinet === cabinet
      );
      return !cabinetBooked;
    }) : CABINET_LIST;

    res.json({
      success: true,
      availableSlots,
      availableCabinets,
      bookedSlots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking availability'
    });
  }
};

const generateTimeSlots = () => {
  const slots = [];
  let currentTime = moment('08:00', 'HH:mm');
  const endTime = moment('21:00', 'HH:mm');
  
  while (currentTime <= endTime) {
    slots.push(currentTime.format('HH:mm'));
    currentTime.add(30, 'minutes');
  }
  
  return slots;
};

// Add this new function for checking dentist availability
export const checkDentistAvailability = async (req, res) => {
  try {
    const { dentistId, date, timeSlot } = req.query;
    console.log('Checking availability for:', { dentistId, date, timeSlot });

    // Get all appointments for the given date and dentist
    const appointments = await Appointment.find({
      dentist: dentistId,
      date: date,
      status: { $ne: 'cancelled' }
    });

    console.log('Found appointments:', appointments);

    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots();
    
    // Get booked time slots
    const bookedSlots = appointments.map(apt => apt.timeSlot);
    console.log('Booked slots:', bookedSlots);

    // Calculate available time slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    console.log('Available slots:', availableSlots);

    // Get available cabinets for specific time slot
    let availableCabinets = ['Cabinet-1', 'Cabinet-2', 'Cabinet-3', 'Cabinet-4'];
    if (timeSlot) {
      const bookedCabinets = appointments
        .filter(apt => apt.timeSlot === timeSlot)
        .map(apt => apt.cabinet);
      availableCabinets = availableCabinets.filter(
        cabinet => !bookedCabinets.includes(cabinet)
      );
    }

    res.json({
      availableSlots,
      availableCabinets,
      bookedSlots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ 
      message: 'Error checking availability',
      error: error.message 
    });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('Updating appointment:', { id, updateData });

    // Find the existing appointment
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check for conflicts only if date, timeSlot, patient, or cabinet is being changed
    if (updateData.date || updateData.timeSlot || updateData.patientId || updateData.cabinet) {
      const conflict = await Appointment.checkConflicts({
        date: updateData.date || existingAppointment.date,
        timeSlot: updateData.timeSlot || existingAppointment.timeSlot,
        patientId: updateData.patientId || existingAppointment.patient,
        cabinet: updateData.cabinet || existingAppointment.cabinet,
        excludeAppointmentId: id
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.message
        });
      }
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
    .populate('dentist', 'name')
    .populate('patient', 'name');

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Notify relevant parties about the update
    await notifyAppointmentUpdated(updatedAppointment);

    console.log('Successfully updated appointment:', updatedAppointment);
    res.json(updatedAppointment);

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name')
      .populate('dentist', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment details',
      error: error.message 
    });
  }
};

// Update the bookAppointment function to include more validation
export const bookAppointment = async (req, res) => {
  try {
    const { dentistId, date, timeSlot, type } = req.body;
    const patientId = req.user._id;

    // Validate required fields
    if (!dentistId || !date || !timeSlot || !type) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['dentistId', 'date', 'timeSlot', 'type'],
        received: { dentistId, date, timeSlot, type }
      });
    }

    // Check if the time slot is in the past
    if (moment(`${date} ${timeSlot}`).isBefore(moment())) {
      return res.status(400).json({
        message: 'Cannot book appointments in the past'
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      dentist: dentistId,
      date: moment(date).format('YYYY-MM-DD'),
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: 'This time slot is already booked',
        conflictingAppointment: {
          patientName: existingAppointment.patientName,
          type: existingAppointment.type
        }
      });
    }

    // Get patient name for the appointment
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      patientName: patient.name,
      dentist: dentistId,
      date: moment(date).format('YYYY-MM-DD'),
      timeSlot,
      type,
      status: 'scheduled'
    });

    // Populate dentist details
    await appointment.populate('dentist', 'name');

    // Send SMS notification
    const smsResult = await sendSMS(
      appointment.patient.phone,
      `Your appointment has been scheduled for ${appointment.date} at ${appointment.timeSlot}`
    ).catch(error => ({
      success: false,
      error: error.message
    }));

    if (!smsResult.success) {
      console.warn('SMS notification failed:', smsResult.error);
      // Continue with the appointment creation even if SMS fails
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ 
      message: 'Error booking appointment',
      error: error.message 
    });
  }
};

// Add a function to cancel appointments
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment belongs to the requesting patient
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Check if appointment is in the past
    if (moment(`${appointment.date} ${appointment.timeSlot}`).isBefore(moment())) {
      return res.status(400).json({ message: 'Cannot cancel past appointments' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      message: 'Error cancelling appointment',
      error: error.message 
    });
  }
};


export const getPatientAppointments = async (req, res) => {
  try {
    // Get the patient ID from the authenticated user
    const patientId = req.user._id;

    // Find all appointments for this patient
    const appointments = await Appointment.find({
      patient: patientId,
      // Optionally filter out old appointments
      date: { $gte: moment().startOf('day').toDate() }
    })
    .populate('dentist', 'name')
    .sort({ date: 1, timeSlot: 1 });

    // Format the appointments for the frontend
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      dentistName: apt.dentist?.name || 'Not assigned',
      date: apt.date,
      timeSlot: apt.timeSlot,
      type: apt.type,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};

export const getPatientAppointmentHistory = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    const appointments = await Appointment.find({
      patient: patientId,
      date: { $lt: moment().startOf('day').toDate() }
    })
    .populate('dentist', 'name')
    .sort({ date: -1 });

    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      dentistName: apt.dentist?.name || 'Not assigned',
      date: apt.date,
      timeSlot: apt.timeSlot,
      type: apt.type,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment history', 
      error: error.message 
    });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');

    console.log('Fetching appointments for date:', today);

    const appointments = await Appointment.find({
      date: today,
      status: { $ne: 'cancelled' }
    })
    .populate('patient', 'name')
    .populate('dentist', 'name')
    .sort({ timeSlot: 1 });

    console.log('Found appointments:', appointments);

    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      patientName: apt.patient?.name || apt.patientName,
      dentistName: apt.dentist?.name || 'Not assigned',
      timeSlot: apt.timeSlot,
      type: apt.type,
      status: apt.status,
      cabinet: apt.cabinet
    }));

    console.log('Formatted appointments:', formattedAppointments);

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching today\'s appointments',
      error: error.message 
    });
  }
};
