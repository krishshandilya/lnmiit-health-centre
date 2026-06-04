const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/specialization/:spec', doctorController.getDoctorsBySpecialization);

router.post('/', authMiddleware, doctorController.createDoctor);
router.put('/:id', authMiddleware, doctorController.updateDoctor);
router.delete('/:id', authMiddleware, doctorController.deleteDoctor);

module.exports = router;
