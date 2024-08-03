const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Create a new goal
router.post('/create', async (req, res) => {
    try {
        const { menteeId, mentorId, title, description, deadline } = req.body;
        const newGoal = new Goal({ menteeId, mentorId, title, description, deadline });
        await newGoal.save();
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// Update goal status
router.put('/update/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const goal = await Goal.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// Example route to get goals
router.get('/', async (req, res) => {
    try {
        const goals = await Goal.find(); // Fetch goals from the database
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Failed to fetch goals' });
    }
});

// Get goals for a mentee
router.get('/mentee/:id', async (req, res) => {
    try {
        const goals = await Goal.find({ menteeId: req.params.id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

module.exports = router;
