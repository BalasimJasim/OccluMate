import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  type: {
    type: String,
    enum: ['appointment', 'prescription', 'followup'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sendDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['email', 'sms', 'both'],
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    enum: ['none', 'confirm', 'reschedule', 'cancel'],
    default: 'none'
  },
  responseDate: Date,
  retries: {
    type: Number,
    default: 0
  },
  lastAttempt: Date
}, {
  timestamps: true
});

// Add indexes for better query performance
reminderSchema.index({ sendDate: 1, status: 1 });
reminderSchema.index({ patient: 1, type: 1 });

export default mongoose.model('Reminder', reminderSchema); 