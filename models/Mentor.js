    const mongoose = require('mongoose');

    const MentorSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        mentorId: { type: String, required: true }
    });

    const Mentor = mongoose.model('Mentor', MentorSchema);
    module.exports = Mentor;
