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
    min: [0, 'Experience cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Experience must be an integer'
    }
  },
  availableDays: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        if (!Array.isArray(v) || v.length === 0) return false;
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return v.every(day => validDays.includes(day));
      },
      message: 'Available days must contain at least one day and consist of valid weekdays'
    }
  },
  consultationTimings: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        const [startStr, endStr] = v.split('-');
        if (!startStr || !endStr) return false;
        
        const parseTimeToMinutesLocal = (timeStr) => {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (!match) return -1;
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const period = match[3] ? match[3].toUpperCase() : null;
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          return hours * 60 + minutes;
        };

        const start = parseTimeToMinutesLocal(startStr.trim());
        const end = parseTimeToMinutesLocal(endStr.trim());
        
        return start !== -1 && end !== -1 && start < end;
      },
      message: 'Consultation start time must be before end time'
    }
  },
  contact: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']
  },
  email: { 
    type: String, 
    required: true,
    match: [/^[a-zA-Z0-9._%+-]+@lnmiit\.ac\.in$/, 'Email must be a valid address ending with @lnmiit.ac.in']
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
