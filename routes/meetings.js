const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const { sendNotification } = require('../utils/notification'); // Ensure this utility is correctly implemented

// Create a new meeting
router.post('/create', async (req, res) => {
    try {
        const { title, date, time, description, zoomLink, mentorId, studentIds } = req.body;

        if (!title || !date || !time || !mentorId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const meeting = new Meeting({
            title,
            date,
            time,
            description,
            zoomLink,
            mentor: mentorId,
            students: studentIds,
        });

        await meeting.save();

        // Add the meeting to the mentor's and students' meetings list
        await Mentor.findByIdAndUpdate(mentorId, { $push: { meetings: meeting._id } });
        await Student.updateMany({ _id: { $in: studentIds } }, { $push: { meetings: meeting._id } });

        // Send notifications to students
        const mentor = await Mentor.findById(mentorId);
        studentIds.forEach(async (studentId) => {
            const student = await Student.findById(studentId);
            sendNotification(student.email, `New meeting scheduled by ${mentor.name}: ${title} on ${date} at ${time}. Join Zoom link: ${zoomLink}`);
        });

        res.status(201).json(meeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all meetings
router.get('/', async (req, res) => {
    try {
        // Fetch all meetings from the database
        const meetings = await Meeting.find().populate('students').populate('mentor');
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Failed to fetch meetings' });
    }
});

// Get details of a specific meeting
router.get('/details/:meetingId', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.meetingId).populate('mentor students');
        res.status(200).json(meeting);
    } catch (error) {
        console.error('Error fetching meeting details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
