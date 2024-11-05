import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

 const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in both User and Patient models
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      user = await Patient.findById(decoded.id).select('-password');
      if (user) {
        user.role = 'Patient'; // Explicitly set role for patients
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Authorization check:', {
      userRole: req.user.role,
      allowedRoles: roles,
      hasPermission: roles.includes(req.user.role)
    });

    // Convert roles to lowercase for case-insensitive comparison
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.log('Authorization failed:', {
        userRole,
        allowedRoles,
        user: req.user
      });
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

export { protect, authorize };
