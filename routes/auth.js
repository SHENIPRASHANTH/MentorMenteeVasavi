const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Adjust path if necessary

// GET the current logged-in student details
router.get('/current-student', async (req, res) => {
    console.log('Session:', req.session);
    console.log('Student ID:', req.session ? req.session.studentId : 'No session');

    if (req.session && req.session.studentId) {
        try {
            const student = await Student.findById(req.session.studentId);
            if (student) {
                res.status(200).json({ name: student.name });
            } else {
                res.status(404).json({ message: 'Student not found' });
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
