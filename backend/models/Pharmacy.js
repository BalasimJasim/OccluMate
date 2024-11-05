import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  phone: String,
  email: String,
  surescriptsId: String, // For Surescripts integration
  isActive: {
    type: Boolean,
    default: true
  },
  integrationSettings: {
    type: {
      type: String,
      enum: ['surescripts', 'direct', 'fax'],
      default: 'direct'
    },
    credentials: {
      apiKey: String,
      apiSecret: String,
      encryptedData: String
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Pharmacy', pharmacySchema); 