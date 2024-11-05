import MedicalRecord from '../models/MedicalRecord.js';

// Get medical record by patient ID
export const getMedicalRecord = async (req, res) => {
  try {
    let record = await MedicalRecord.findOne({ patient: req.params.patientId });
    
    // If no record exists, create an empty one
    if (!record) {
      record = new MedicalRecord({
        patient: req.params.patientId,
        diagnoses: [],
        treatments: [],
        allergies: [],
        medications: []
      });
      await record.save();
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ 
      message: 'Error fetching medical record', 
      error: error.message 
    });
  }
};

// Update medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    // Debug log to see user information
    console.log('Update medical record request:', {
      user: req.user,
      role: req.user.role,
      body: req.body,
      params: req.params
    });

    // Check if user has permission (case-insensitive comparison)
    const userRole = req.user.role.toLowerCase();
    if (!['dentist', 'admin'].includes(userRole)) {
      console.log('Permission denied for role:', userRole);
      return res.status(403).json({ 
        message: 'Only Dentists and Admins can update medical records',
        currentRole: req.user.role,
        allowedRoles: ['Dentist', 'Admin']
      });
    }

    const { diagnoses, treatments, allergies } = req.body;
    let record = await MedicalRecord.findOne({ patient: req.params.patientId });

    // Validate treatments data
    if (treatments) {
      const validTreatments = treatments.filter(t => 
        t.treatment?.trim() && 
        t.treatmentDate
      ).map(t => ({
        treatment: t.treatment.trim(),
        treatmentDate: t.treatmentDate,
        notes: t.notes?.trim() || ''
      }));
      treatments.length = 0;
      treatments.push(...validTreatments);
    }

    // Validate diagnoses data
    if (diagnoses) {
      const validDiagnoses = diagnoses.filter(d => 
        d.diagnosis?.trim() && 
        d.diagnosisDate
      ).map(d => ({
        diagnosis: d.diagnosis.trim(),
        diagnosisDate: d.diagnosisDate
      }));
      diagnoses.length = 0;
      diagnoses.push(...validDiagnoses);
    }

    if (!record) {
      record = new MedicalRecord({
        patient: req.params.patientId,
        diagnoses: diagnoses || [],
        treatments: treatments || [],
        allergies: allergies?.filter(a => a.trim()) || []
      });
    } else {
      if (diagnoses) record.diagnoses = diagnoses;
      if (treatments) record.treatments = treatments;
      if (allergies) record.allergies = allergies.filter(a => a.trim());
      record.lastUpdated = Date.now();
    }

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ 
      message: 'Error updating medical record', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
