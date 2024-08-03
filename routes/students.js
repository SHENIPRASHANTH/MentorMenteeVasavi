const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Meeting = require('../models/Meeting');  // Ensure this model is defined
const Query = require('../models/Query');  // Ensure this model is defined

// Register a student
router.post('/register', async (req, res) => {
    const { name, email, password, rollNumber, parentEmail, parentPhone, studentPhone, mentorId } = req.body;

    try {
        let student = await Student.findOne({ email });
        if (student) {
            return res.status(400).json({ error: 'Student already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        student = new Student({
            name,
            email,
            password: hashedPassword,
            rollNumber,
            parentEmail,
            parentPhone,
            studentPhone,
            mentor: mentorId || null
        });

        await student.save();
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (err) {
        console.error('Error registering student:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login a student
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ msg: 'Student not found' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        req.session.studentId = student._id;
        res.json({ msg: 'Student logged in successfully', redirectUrl: '/student-dashboard' });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add attendance
router.post('/attendance', async (req, res) => {
    const { date, status } = req.body;
    const studentId = req.session.studentId;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.attendance.push({ date, status });
        await student.save();
        res.status(201).json({ message: 'Attendance added successfully' });
    } catch (error) {
        console.error('Error adding attendance:', error);
        res.status(500).json({ error: 'Failed to add attendance' });
    }
});

// Add hackathon certificate
router.post('/certificates', async (req, res) => {
    const { name, date } = req.body;
    const studentId = req.session.studentId;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.certificates.push({ name, date });
        await student.save();
        res.status(201).json({ message: 'Certificate added successfully' });
    } catch (error) {
        console.error('Error adding certificate:', error);
        res.status(500).json({ error: 'Failed to add certificate' });
    }
});

// Add academic details
router.post('/academics', async (req, res) => {
    const { semester, subject, mid1, mid2, semesterMarks } = req.body;
    const studentId = req.session.studentId;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.academics.push({ semester, subject, mid1, mid2, semesterMarks });
        await student.save();
        res.status(201).json({ message: 'Academic details added successfully' });
    } catch (error) {
        console.error('Error adding academic details:', error);
        res.status(500).json({ error: 'Failed to add academic details' });
    }
});

// Get details of a specific student
router.get('/:studentId/details', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findById(studentId).populate('mentor', 'name');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Failed to fetch student details' });
    }
});

// Get meetings for a student
router.get('/meetings/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('mentor');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const meetings = await Meeting.find({ mentor: student.mentor._id });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch performance details of a specific student
router.get('/:studentId/performance', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findById(studentId).populate('mentor');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({
            attendance: student.attendance,
            certificates: student.certificates,
            academics: student.academics
        });
    } catch (error) {
        console.error('Error fetching student performance:', error);
        res.status(500).json({ error: 'Failed to fetch student performance' });
    }
});

// Get the mentor for a logged-in student
router.get('/mentor', async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId).populate('mentor');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ mentor: student.mentor });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a query
router.post('/post', async (req, res) => {
    const { studentName, mentorName, queryText } = req.body;

    try {
        const newQuery = new Query({
            studentName,
            mentorName,
            queryText,
            status: 'open',
            createdAt: new Date()
        });

        await newQuery.save();
        res.status(201).json({ message: 'Query posted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error posting query.' });
    }
});

// Fetch queries for a mentor
router.get('/mentor/:mentorName', async (req, res) => {
    const { mentorName } = req.params;

    try {
        const queries = await Query.find({ mentorName });
        res.status(200).json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching queries.' });
    }
});

// Respond to a query
router.post('/respond', async (req, res) => {
    const { queryId, response } = req.body;

    try {
        await Query.findByIdAndUpdate(queryId, { response, status: 'answered' });
        res.status(200).json({ message: 'Response recorded.' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving response.' });
    }
});

module.exports = router;
