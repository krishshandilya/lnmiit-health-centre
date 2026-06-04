const Doctor = require('../models/Doctor');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to parse "HH:MM" or "HH:MM AM" to minutes
const parseTimeToMinutes = (timeStr) => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

const checkRoomConflict = async (roomNumber, availableDays, consultationTimings, excludeId = null) => {
  const [newStartStr, newEndStr] = consultationTimings.split('-');
  if (!newStartStr || !newEndStr) return null;
  
  const newStart = parseTimeToMinutes(newStartStr.trim());
  const newEnd = parseTimeToMinutes(newEndStr.trim());

  const query = {
    roomNumber,
    availableDays: { $in: availableDays }
  };
  if (excludeId) query._id = { $ne: excludeId };
  
  const doctorsInRoom = await Doctor.find(query);
  
  for (const doc of doctorsInRoom) {
    const [docStartStr, docEndStr] = doc.consultationTimings.split('-');
    if (!docStartStr || !docEndStr) continue;
    
    const docStart = parseTimeToMinutes(docStartStr.trim());
    const docEnd = parseTimeToMinutes(docEndStr.trim());
    
    // Check for overlap
    if (newStart < docEnd && docStart < newEnd) {
      return `Room ${roomNumber} is already occupied by ${doc.name} during overlapping timings.`;
    }
  }
  return null;
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctors by specialization
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    // using case insensitive search with escaped regex characters
    const escapedSpec = escapeRegExp(req.params.spec);
    const doctors = await Doctor.find({ 
      specialization: new RegExp(`^${escapedSpec}$`, 'i') 
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new doctor
exports.createDoctor = async (req, res) => {
  try {
    const { doctorId, roomNumber, availableDays, consultationTimings } = req.body;

    // Check doctorId uniqueness
    const existingDoc = await Doctor.findOne({ doctorId });
    if (existingDoc) {
      return res.status(400).json({ message: 'Doctor ID is already taken. Please use a unique ID.' });
    }

    // Check room conflict
    const conflictError = await checkRoomConflict(roomNumber, availableDays, consultationTimings);
    if (conflictError) {
      return res.status(400).json({ message: conflictError });
    }

    const doctor = new Doctor(req.body);
    const newDoctor = await doctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Strip doctorId to ensure it is immutable
    delete req.body.doctorId;

    // Use values from req.body if provided, otherwise fall back to current database values
    const roomNumber = req.body.roomNumber !== undefined ? req.body.roomNumber : doctor.roomNumber;
    const availableDays = req.body.availableDays !== undefined ? req.body.availableDays : doctor.availableDays;
    const consultationTimings = req.body.consultationTimings !== undefined ? req.body.consultationTimings : doctor.consultationTimings;

    // Check room conflict with merged values
    if (roomNumber && availableDays && consultationTimings) {
      const conflictError = await checkRoomConflict(roomNumber, availableDays, consultationTimings, req.params.id);
      if (conflictError) {
        return res.status(400).json({ message: conflictError });
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
