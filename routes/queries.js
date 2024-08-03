const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const io = require('../app').io; // Ensure this path is correct
// POST route to submit a new query
router.post('/submit-query', async (req, res) => {
    try {
        const { studentName, mentorName, queryText } = req.body;
        const newQuery = new Query({ studentName, mentorName, queryText });
        await newQuery.save();
        
        // Emit an event after saving the query
        io.emit('newQuery', { mentorName });
        
        res.status(201).json({ message: 'Query submitted successfully' });
    } catch (error) {
        console.error('Error submitting query:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/queries', async (req, res) => {
    const mentorName = req.query.mentorName;
    console.log('Fetching queries for:', mentorName); // Debug log

    try {
        const queries = await Query.find({ mentorName }).sort({ createdAt: -1 });
        console.log('Fetched queries:', queries); // Debug log
        res.json(queries);
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
