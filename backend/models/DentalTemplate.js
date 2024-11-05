import mongoose from 'mongoose';

const dentalTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['examination', 'procedure', 'treatment', 'followup']
  },
  fields: [{
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'number', 'checkbox', 'select', 'date', 'textarea']
    },
    options: [String], // For select type fields
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  commonNotes: [{
    text: String,
    category: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('DentalTemplate', dentalTemplateSchema); 