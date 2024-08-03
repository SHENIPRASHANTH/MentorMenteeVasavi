const mongoose = require('mongoose');

// Define the schema for academics
const AcademicSchema = new mongoose.Schema({
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    mid1: { type: Number, required: true },
    mid2: { type: Number, required: true },
    semesterMarks: { type: Number, required: true }
});

const CertificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    filePath: { type: String, required: true } // This field stores the path to the uploaded file
});

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rollNumber: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    studentPhone: { type: String, required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: false },
    attendance: [{ date: Date, status: String }],
    certificates: [{ name: String, date: Date }],
    academics: [{ semester: String, subject: String, mid1: Number, mid2: Number, semesterMarks: Number }]
});

module.exports = mongoose.model('Student', StudentSchema);

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;
