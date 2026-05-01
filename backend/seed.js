const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('./models/Doctor');

const sampleDoctors = [
  {
    name: "Dr. Anjali Sharma",
    specialization: "General Physician",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: 12,
    availableDays: ["Monday", "Wednesday", "Friday"],
    consultationTimings: "10:00 AM - 02:00 PM",
    contact: "+91-9876543210",
    email: "anjali.sharma@lnmiit.ac.in",
    roomNumber: "101"
  },
  {
    name: "Dr. Rajesh Verma",
    specialization: "Orthopedic",
    qualification: "MBBS, MS (Orthopedics)",
    experience: 8,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    consultationTimings: "11:00 AM - 03:00 PM",
    contact: "+91-8765432109",
    email: "rajesh.verma@lnmiit.ac.in",
    roomNumber: "102"
  },
  {
    name: "Dr. Meera Patel",
    specialization: "Dentist",
    qualification: "BDS, MDS",
    experience: 5,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    consultationTimings: "09:00 AM - 01:00 PM",
    contact: "+91-7654321098",
    email: "meera.patel@lnmiit.ac.in",
    roomNumber: "103"
  },
  {
    name: "Dr. Vikram Singh",
    specialization: "Psychiatrist",
    qualification: "MBBS, MD (Psychiatry)",
    experience: 15,
    availableDays: ["Friday", "Saturday"],
    consultationTimings: "02:00 PM - 06:00 PM",
    contact: "+91-6543210987",
    email: "vikram.singh@lnmiit.ac.in",
    roomNumber: "104"
  },
  {
    name: "Dr. Sneha Desai",
    specialization: "Dermatologist",
    qualification: "MBBS, DDVL",
    experience: 6,
    availableDays: ["Wednesday", "Thursday"],
    consultationTimings: "10:30 AM - 01:30 PM",
    contact: "+91-5432109876",
    email: "sneha.desai@lnmiit.ac.in",
    roomNumber: "105"
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lnmiit-health')
  .then(async () => {
    console.log('Connected to MongoDB. Seeding data...');
    await Doctor.deleteMany(); // Clear existing docs
    await Doctor.insertMany(sampleDoctors);
    console.log('Sample doctors seeded successfully.');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    mongoose.disconnect();
  });
