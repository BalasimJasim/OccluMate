import mongoose from 'mongoose';
import moment from 'moment';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dentistName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return moment(v, 'YYYY-MM-DD', true).isValid();
      },
      message: props => `${props.value} is not a valid date!`
    }
  },
  timeSlot: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time slot!`
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['checkup', 'cleaning', 'filling', 'extraction', 'root-canal', 'consultation', 'other'],
    default: 'checkup'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  cabinet: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add static methods to the schema
appointmentSchema.statics.getAvailableSlots = async function(date, dentistId) {
  const START_TIME = '08:00';
  const END_TIME = '21:00';
  const SLOT_DURATION = 30; // minutes
  
  // Generate all possible time slots
  const allSlots = [];
  let currentTime = moment(START_TIME, 'HH:mm');
  const endTime = moment(END_TIME, 'HH:mm');
  
  while (currentTime < endTime) {
    allSlots.push(currentTime.format('HH:mm'));
    currentTime.add(SLOT_DURATION, 'minutes');
  }

  // Find existing appointments for the given date and dentist
  const bookedAppointments = await this.find({
    dentist: dentistId,
    date: date,
    status: { $ne: 'cancelled' }
  });

  // Get booked time slots
  const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  return {
    availableSlots,
    bookedSlots,
    availableCabinets: ['Cabinet-1', 'Cabinet-2', 'Cabinet-3', 'Cabinet-4']
  };
};

appointmentSchema.statics.checkSlotAvailability = async function(date, timeSlot, dentistId, cabinet) {
  const appointment = await this.findOne({
    date: date,
    timeSlot: timeSlot,
    dentist: dentistId,
    status: { $ne: 'cancelled' }
  });

  if (appointment) {
    return {
      isAvailable: false,
      reason: 'time_slot_taken',
      conflictingAppointment: appointment
    };
  }

  // Check cabinet availability
  const cabinetAppointment = await this.findOne({
    date: date,
    timeSlot: timeSlot,
    cabinet: cabinet,
    status: { $ne: 'cancelled' }
  });

  if (cabinetAppointment) {
    return {
      isAvailable: false,
      reason: 'cabinet_occupied',
      conflictingAppointment: cabinetAppointment
    };
  }

  return {
    isAvailable: true,
    reason: null,
    conflictingAppointment: null
  };
};

appointmentSchema.pre('save', function(next) {
  // Format date to YYYY-MM-DD if it's not already
  if (this.date && !this.date.includes('T')) {
    this.date = moment(this.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  }
  next();
});

appointmentSchema.statics.checkAvailability = async function({
  dentistId,
  date,
  timeSlot,
  cabinet,
  excludeAppointmentId
}) {
  try {
    // Find conflicting appointments
    const query = {
      dentist: dentistId,
      date: date,
      timeSlot: timeSlot,
      _id: { $ne: excludeAppointmentId }, // Exclude current appointment when updating
      status: { $ne: 'cancelled' }
    };

    if (cabinet) {
      query.cabinet = cabinet;
    }

    const existingAppointment = await this.findOne(query);

    if (existingAppointment) {
      return {
        isAvailable: false,
        reason: cabinet 
          ? `Cabinet ${cabinet} is already booked for this time slot`
          : 'Time slot is already booked'
      };
    }

    return {
      isAvailable: true
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

appointmentSchema.statics.checkConflicts = async function({
  date,
  timeSlot,
  patientId,
  cabinet,
  excludeAppointmentId // for updates
}) {
  const query = {
    date: date,
    timeSlot: timeSlot,
    status: { $ne: 'cancelled' }
  };

  // Exclude current appointment when updating
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  // Check for patient conflicts
  if (patientId) {
    const patientConflict = await this.findOne({
      ...query,
      patient: patientId
    });

    if (patientConflict) {
      return {
        hasConflict: true,
        type: 'patient',
        message: 'Patient already has an appointment at this time'
      };
    }
  }

  // Check for cabinet conflicts
  if (cabinet) {
    const cabinetConflict = await this.findOne({
      ...query,
      cabinet: cabinet
    });

    if (cabinetConflict) {
      return {
        hasConflict: true,
        type: 'cabinet',
        message: `Cabinet ${cabinet} is already booked for this time slot`
      };
    }
  }

  return {
    hasConflict: false
  };
};

export default mongoose.model('Appointment', appointmentSchema);
