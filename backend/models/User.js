import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['Admin', 'Dentist','Patient', 'Receptionist'],
    required: [true, 'Please specify a role'],
    default: 'Receptionist'
  },
}, {
  timestamps: true,
});

// Add a pre-save hook to log the role
userSchema.pre('save', async function(next) {
  console.log('Saving user with role:', this.role);
  
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Matching password for user:', this.email);
    console.log('Stored password hash:', this.password);
    console.log('Entered password:', enteredPassword);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error matching password:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
