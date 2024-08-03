const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

// Route to register a new mentor
router.post('/register', async (req, res) => {
    const { name, email, password, mentorId } = req.body;

    try {
        let mentor = await Mentor.findOne({ email });

        if (mentor) {
            return res.status(400).json({ msg: 'Mentor already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        mentor = new Mentor({
            name,
            email,
            password: hashedPassword,
            mentorId
        });

        await mentor.save();
        res.status(201).json({ message: 'Mentor registered successfully' });
    } catch (error) {
        console.error('Error registering mentor:', error.message);
        res.status(500).json({ error: 'Failed to register mentor' });
    }
});

// Route to login mentor
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let mentor = await Mentor.findOne({ email });

        if (!mentor) {
            return res.status(400).json({ msg: 'Mentor not found' });
        }

        const isMatch = await bcrypt.compare(password, mentor.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        req.session.mentorId = mentor._id; // Store mentor ID in session
        res.json({ msg: 'Mentor logged in successfully', redirectUrl: '/mentor-dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Route to get all mentors
router.get('/', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.json(mentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).send('Failed to fetch mentors');
    }
});

// Route to get the currently logged-in mentor
router.get('/me', async (req, res) => {
    try {
        const mentorId = req.session.mentorId; // Get mentor ID from session
        if (!mentorId) {
            return res.status(401).json({ msg: 'Not authenticated' });
        }
        
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }
        
        res.json(mentor);
    } catch (error) {
        console.error('Error fetching mentor details:', error);
        res.status(500).send('Failed to fetch mentor details');
    }
});

// Route to schedule a meeting
router.post('/schedule-meeting', async (req, res) => {
    const { studentId, date, topic, description } = req.body;
    const mentorId = req.session.mentorId;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        // Create a new meeting entry
        const meeting = new Meeting({
            student: studentId,
            mentor: mentorId,
            date,
            topic,
            description
        });

        await meeting.save();

        student.meetings.push(meeting._id);
        await student.save();

        res.status(201).json({ message: 'Meeting scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        res.status(500).json({ error: 'Failed to schedule meeting' });
    }
});

// Fetch meetings for a specific mentor
router.get('/:mentorId/meetings', async (req, res) => {
    const mentorId = req.params.mentorId;

    try {
        const meetings = await Meeting.find({ mentor: mentorId }).populate('student');
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).send('Failed to fetch meetings');
    }
});

// Route to get students for a specific mentor
router.get('/:mentorId/students', async (req, res) => {
    try {
        const mentorId = req.params.mentorId;
        const students = await Student.find({ mentor: mentorId });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Failed to fetch students');
    }
});
// Fetch meetings for a specific mentor
router.get('/:mentorId/meetings', async (req, res) => {
    try {
        const mentorId = req.params.mentorId;
        const meetings = await Meeting.find({ mentor: mentorId }).populate('student');
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).send('Failed to fetch meetings');
    }
});

// Route to render the mentor dashboard
router.get('/mentor-dashboard', async (req, res) => {
    const mentorId = req.session.mentorId;

    try {
        if (!mentorId) {
            return res.redirect('/mentor/login');
        }

        const meetings = await Meeting.find({ mentor: mentorId }).populate('student', 'name email');
        res.render('mentor-dashboard', { meetings });
    } catch (error) {
        console.error('Error fetching meetings for dashboard:', error);
        res.status(500).send('Failed to fetch meetings');
    }
});
// In routes/mentors.js
router.get('/names', async (req, res) => {
    try {
        const mentors = await Mentor.find({}, 'name _id');
        res.json(mentors);
    } catch (err) {
        console.error('Error fetching mentor names:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
