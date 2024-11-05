import DentalChart from '../models/DentalChart.js';

// Get dental chart for a patient
export const getDentalChart = async (req, res) => {
  try {
    const chart = await DentalChart.findOne({ patient: req.params.patientId });
    res.json({
      success: true,
      chartData: chart?.chartData || {}  // Ensure we always return an object
    });
  } catch (error) {
    console.error('Error fetching dental chart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dental chart'
    });
  }
};

// Update dental chart
export const updateDentalChart = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { chartData } = req.body;

    console.log('Updating dental chart for patient:', patientId);
    console.log('Chart data received:', chartData);

    let dentalChart = await DentalChart.findOne({ patient: patientId });

    if (!dentalChart) {
      // Create new dental chart if it doesn't exist
      dentalChart = await DentalChart.create({
        patient: patientId,
        chartData: new Map(Object.entries(chartData))
      });
    } else {
      // Convert the chartData object to a Map before saving
      dentalChart.chartData = new Map(Object.entries(chartData));
      await dentalChart.save();
    }

    // Convert Map back to object for response
    const responseData = Object.fromEntries(dentalChart.chartData);
    res.json({ success: true, data: responseData });

  } catch (error) {
    console.error('Error updating dental chart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating dental chart',
      error: error.message 
    });
  }
};
