import mongoose from 'mongoose';

const dentalChartSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  chartData: {
    type: Map,
    of: {
      type: Object,
      default: {}
    }
  }
}, {
  timestamps: true
});

const DentalChart = mongoose.model('DentalChart', dentalChartSchema);

export default DentalChart;
