const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');

const meetingsRouter = require('./routes/meetings');
const mentorRouter = require('./routes/mentors');
const studentRouter = require('./routes/students');
const queryRouter = require('./routes/queries');
const certificatesRoute = require('./routes/certificates');
const authRouter = require('./routes/auth');
const goalsRouter = require('./routes/goals');
const Mentor = require('./models/Mentor'); // Assuming Mentor is your Mongoose model

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialize Socket.IO

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection setup
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost/mentormentee';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB');
});
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Import and use routes
app.use('/api/meetings', meetingsRouter);
app.use('/api/mentors', mentorRouter);
app.use('/api/students', studentRouter);
app.use('/api/queries', queryRouter);
app.use('/api/auth', authRouter);
app.use('/api/goals', goalsRouter);

// Routes to serve dashboards
app.get('/mentor-dashboard', (req, res) => {
    if (req.session.mentorId) {
        res.sendFile(path.join(__dirname, 'public', 'mentorDashboard.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/student-dashboard', (req, res) => {
    if (req.session.studentId) {
        res.sendFile(path.join(__dirname, 'public', 'studentDashboard.html'));
    } else {
        res.redirect('/login');
    }
});

// Example route for fetching mentors
app.get('/api/mentors', async (req, res) => {
    try {
        const mentors = await Mentor.find(); // Assuming Mentor is your model
        res.json(mentors.map(mentor => ({
            _id: mentor._id,
            name: mentor.name
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// Catch-all route to serve index.html (for SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('send_message', (data) => {
        io.emit('receive_message', data); // Broadcast message to all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/', // Directory to save uploaded files
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
            return cb(new Error('Please upload an image or PDF file'));
        }
        cb(undefined, true);
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.send({ file: req.file });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
