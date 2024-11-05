import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: true,
    select: false // Hide password by default
  },
  temporaryPassword: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
  },
  age: {
    type: Number,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  portalActivated: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
});

// Generate random password
patientSchema.statics.generateTempPassword = function() {
  return Math.random().toString(36).slice(-8);
};

// Hash password before saving
patientSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
