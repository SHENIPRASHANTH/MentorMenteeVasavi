// routes/certificates.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Student'); // Correct the path if needed

const router = express.Router();

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates'); // Save in the certificates directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp + file extension
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|pdf/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// Define a route for uploading certificates
router.post('/upload', upload.single('certificate'), async (req, res) => {
    try {
        const { studentId, name, date } = req.body;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;

        if (!studentId || !name || !date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the student by ID and add the certificate details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add the certificate details
        student.certificates.push({ filePath, name, date });

        // Save the student document
        await student.save();

        res.status(200).json({ message: 'Certificate uploaded successfully' });
    } catch (error) {
        console.error('Error uploading certificate:', error);
        res.status(500).json({ message: 'Error uploading certificate', error });
    }
});

module.exports = router;
