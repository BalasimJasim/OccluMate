import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
      index: true,
    },
    diagnoses: [
      {
        diagnosis: {
          type: String,
          required: true,
          trim: true,
        },
        diagnosisDate: {
          type: Date,
          required: true,
        },
      },
    ],
    treatments: [
      {
        treatment: {
          type: String,
          required: true,
          trim: true,
        },
        treatmentDate: {
          type: Date,
          required: true,
        },
        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MedicalRecord', medicalRecordSchema);
