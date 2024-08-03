const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    description: { type: String },
    zoomLink: { type: String },  // Add this line
    mentor: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', MeetingSchema);

module.exports = Meeting;
