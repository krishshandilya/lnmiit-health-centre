const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^DOC-\d{3}$/, 'Doctor ID must be in the format DOC-XXX (e.g., DOC-001)']
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\.]+$/, 'Name can only contain letters, spaces, and dots']
  },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { 
    type: Number, 
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'Experience must be an integer'
    }
  },
  availableDays: { type: [String], required: true },
  consultationTimings: { type: String, required: true },
  contact: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']
  },
  email: { 
    type: String, 
    required: true,
    match: [/.*@lnmiit\.ac\.in$/, 'Email must end with @lnmiit.ac.in']
  },
  roomNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        const num = parseInt(v, 10);
        return !isNaN(num) && num >= 100 && num <= 120;
      },
      message: 'Room number must be between 100 and 120'
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
