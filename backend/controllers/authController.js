import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import Patient from '../models/Patient.js';

// Generate JWT Token
const generateToken = (id) => {
  try {
    console.log('Generating token for id:', id);
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('Generated token:', token);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide both email and password' 
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        detail: 'No user found with this email' 
      });
    }

    console.log('User found:', user._id);

    if (!user.password) {
      console.log('User has no password hash stored');
      return res.status(500).json({ 
        message: 'User account is not properly set up',
        detail: 'No password hash found' 
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', user._id);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        detail: 'Password does not match' 
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('Login successful for user:', user._id);
    res.json({ 
      token, 
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login',
      detail: error.message 
    });
  }
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registration attempt with:', { name, email, role });

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const validRoles = ['Admin', 'Dentist', 'Receptionist'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles,
        receivedRole: role
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      console.log('Created user:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.stack
    });
  }
};

// Patient Login
export const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find patient with password included
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if using temporary password
    if (patient.temporaryPassword) {
      return res.json({
        temporaryPassword: true,
        patientId: patient._id
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: patient._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'Patient'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};
