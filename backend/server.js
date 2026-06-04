const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require('./routes/authRoutes');
const Doctor = require('./models/Doctor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'http://localhost:5000') 
    : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'An internal server error occurred.' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    
    // Auto-seed if database is empty (bypasses local network restrictions)
    try {
      const count = await Doctor.countDocuments();
      if (count === 0) {
        console.log('Database is empty. Auto-seeding initial doctor profiles...');
        const sampleDoctors = [
          {
            doctorId: "DOC-001",
            name: "Dr. Anjali Sharma",
            specialization: "General Physician",
            qualification: "MBBS, MD (Internal Medicine)",
            experience: 12,
            availableDays: ["Monday", "Wednesday", "Friday"],
            consultationTimings: "10:00 - 14:00",
            contact: "9876543210",
            email: "anjali.sharma@lnmiit.ac.in",
            roomNumber: "101"
          },
          {
            doctorId: "DOC-002",
            name: "Dr. Rajesh Verma",
            specialization: "Orthopedic",
            qualification: "MBBS, MS (Orthopedics)",
            experience: 8,
            availableDays: ["Tuesday", "Thursday", "Saturday"],
            consultationTimings: "11:00 - 15:00",
            contact: "8765432109",
            email: "rajesh.verma@lnmiit.ac.in",
            roomNumber: "102"
          },
          {
            doctorId: "DOC-003",
            name: "Dr. Meera Patel",
            specialization: "Dentist",
            qualification: "BDS, MDS",
            experience: 5,
            availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            consultationTimings: "09:00 - 13:00",
            contact: "7654321098",
            email: "meera.patel@lnmiit.ac.in",
            roomNumber: "103"
          },
          {
            doctorId: "DOC-004",
            name: "Dr. Vikram Singh",
            specialization: "Psychiatrist",
            qualification: "MBBS, MD (Psychiatry)",
            experience: 15,
            availableDays: ["Friday", "Saturday"],
            consultationTimings: "14:00 - 18:00",
            contact: "6543210987",
            email: "vikram.singh@lnmiit.ac.in",
            roomNumber: "104"
          },
          {
            doctorId: "DOC-005",
            name: "Dr. Sneha Desai",
            specialization: "Dermatologist",
            qualification: "MBBS, DDVL",
            experience: 6,
            availableDays: ["Wednesday", "Thursday"],
            consultationTimings: "10:30 - 13:30",
            contact: "5432109876",
            email: "sneha.desai@lnmiit.ac.in",
            roomNumber: "105"
          }
        ];
        await Doctor.insertMany(sampleDoctors);
        console.log('Database seeded with sample doctors.');
      }
    } catch (seedErr) {
      console.error('Failed to auto-seed database:', seedErr);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
