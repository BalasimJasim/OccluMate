import { validationResult } from 'express-validator';
import Patient from '../models/Patient.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';

// Add a new patient
export const addPatient = async (req, res) => {
  try {
    const { name, email, phone, address, age, medicalHistory } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = Patient.generateTempPassword();

    // Create patient with temporary password
    const patient = await Patient.create({
      name,
      email,
      password: tempPassword,
      phone,
      address,
      age,
      medicalHistory,
      temporaryPassword: true,
      portalActivated: false
    });

    // In development, return the temporary password
    if (process.env.NODE_ENV === 'development') {
      res.status(201).json({
        success: true,
        message: 'Patient added successfully',
        data: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          age: patient.age,
          medicalHistory: patient.medicalHistory
        },
        temporaryPassword: tempPassword // Only in development
      });
    } else {
      // In production, send email and don't return password
      await sendEmail({
        to: email,
        subject: 'Your Dental Portal Access',
        text: `
          Welcome to our Dental Practice Portal!
          
          Your temporary login credentials are:
          Email: ${email}
          Password: ${tempPassword}
          
          Please login at: ${process.env.FRONTEND_URL}/patient-login
          You will be required to change your password upon first login.
        `
      });

      res.status(201).json({
        success: true,
        message: 'Patient added successfully. Portal access details sent via email.',
        data: patient
      });
    }
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding patient', 
      error: error.message 
    });
  }
};

// Get all patients with pagination
export const getAllPatients = async (req, res) => {
  try {
    console.log("[getAllPatients] Fetching patients...");
    const patients = await Patient.find();
    console.log("[getAllPatients] Found patients:", patients.length);
    console.log("[getAllPatients] First few patients:", patients.slice(0, 2));
    res.json(patients);
  } catch (error) {
    console.error("[getAllPatients] Error fetching patients:", error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// Get a specific patient by ID
export const getPatientById = async (req, res) => {
  try {
    console.log('Getting patient by ID:', req.params.id);
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      console.log('Patient not found');
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    console.log('Patient found:', patient);
    res.json(patient);
  } catch (error) {
    console.error('Error in getPatientById:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient',
      error: error.message
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const { name, email, phone, address, age, medicalHistory } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email !== patient.email) {
      const emailExists = await Patient.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    patient.name = name;
    patient.email = email;
    patient.phone = phone;
    patient.address = address;
    patient.age = age;
    patient.medicalHistory = medicalHistory;

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ 
      message: 'Error updating patient', 
      error: error.message 
    });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Use deleteOne() instead of remove()
    await Patient.deleteOne({ _id: req.params.id });
    
    res.json({ 
      success: true,
      message: 'Patient removed successfully' 
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting patient', 
      error: error.message 
    });
  }
};

// Add a new endpoint for patient portal activation
export const activatePortal = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId).select('+password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify current (temporary) password
    const isMatch = await bcrypt.compare(currentPassword, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Update password and activate portal
    patient.password = newPassword;
    patient.temporaryPassword = false;
    patient.portalActivated = true;
    await patient.save();

    res.json({
      success: true,
      message: 'Portal activated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
