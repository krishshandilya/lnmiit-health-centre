const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
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
  roomNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
