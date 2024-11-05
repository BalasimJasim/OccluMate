import mongoose from 'mongoose';

const patientSettingsSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    unique: true
  },
  reminderPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    appointmentReminder: { type: Number, default: 24 }, // hours before
    prescriptionReminder: { type: Boolean, default: true },
    documentNotifications: { type: Boolean, default: true }
  },
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'email'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr'],
      default: 'en'
    }
  },
  notifications: {
    appointments: { type: Boolean, default: true },
    prescriptions: { type: Boolean, default: true },
    documents: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export default mongoose.model('PatientSettings', patientSettingsSchema); 