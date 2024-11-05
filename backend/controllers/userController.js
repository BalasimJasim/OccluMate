import User from '../models/User.js';

// Get all dentists
export const getDentists = async (req, res) => {
  try {
    // Use case-insensitive query
    const dentists = await User.find({ 
      role: { $regex: new RegExp('^dentist$', 'i') }
    })
      .select('name email _id')
      .sort({ name: 1 });

    console.log('Found dentists:', dentists); // Debug log

    res.json(dentists);
  } catch (error) {
    console.error('Error fetching dentists:', error);
    res.status(500).json({ 
      message: 'Error fetching dentists', 
      error: error.message 
    });
  }
};
