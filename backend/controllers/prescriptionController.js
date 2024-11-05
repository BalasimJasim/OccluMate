import Prescription from '../models/Prescription.js';
import sendEmail from '../utils/sendEmail.js';

// Create a prescription
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes, refillable, refillsRemaining, expiryDate } = req.body;
    
    const prescription = new Prescription({
      patient: patientId,
      dentist: req.user._id,
      medications,
      notes,
      refillable,
      refillsRemaining,
      expiryDate
    });

    const savedPrescription = await prescription.save();
    
    // Populate patient and dentist details
    await savedPrescription.populate([
      { path: 'patient', select: 'name email' },
      { path: 'dentist', select: 'name' }
    ]);

    // Create email content
    const emailContent = {
      to: savedPrescription.patient.email,
      subject: 'New Prescription from OccluMate Dental',
      html: `
        <h2>New Prescription from Dr. ${savedPrescription.dentist.name}</h2>
        <p>Dear ${savedPrescription.patient.name},</p>
        <p>A new prescription has been issued for you. Details are as follows:</p>
        
        <h3>Medications:</h3>
        <ul>
          ${medications.map(med => `
            <li>
              <strong>${med.name}</strong><br>
              Dosage: ${med.dosage}<br>
              Frequency: ${med.frequency}<br>
              Duration: ${med.duration}<br>
              ${med.instructions ? `Instructions: ${med.instructions}` : ''}
            </li>
          `).join('')}
        </ul>
        
        <p>Please show this email to your pharmacist or log in to your patient portal to view the full prescription details.</p>
        
        <p>Best regards,<br>
        Dr. ${savedPrescription.dentist.name}<br>
        OccluMate Dental Clinic</p>
      `
    };

    // Send email using the default imported sendEmail function
    await sendEmail(emailContent);

    res.status(201).json(savedPrescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ 
      message: 'Error creating prescription', 
      error: error.message 
    });
  }
};

// Get patient's prescriptions
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patient: req.params.patientId 
    })
    .populate('dentist', 'name')
    .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching prescriptions', 
      error: error.message 
    });
  }
};

// Update prescription status
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('dentist', 'name');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating prescription', 
      error: error.message 
    });
  }
};

// Request prescription refill
export const requestRefill = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (!prescription.refillable || prescription.refillsRemaining <= 0) {
      return res.status(400).json({ message: 'No refills available' });
    }

    prescription.refillsRemaining -= 1;
    await prescription.save();

    // Send notification to dentist about refill request
    // TODO: Implement notification system

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error requesting refill', 
      error: error.message 
    });
  }
};

// Get active prescriptions
export const getActivePrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.params.patientId,
      status: 'active',
      expiryDate: { $gt: new Date() }
    }).populate('dentist', 'name');

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching active prescriptions', 
      error: error.message 
    });
  }
};
