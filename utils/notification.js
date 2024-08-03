const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure this line is included if using dotenv

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use true for port 465, false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true,  // Enables logging to console
    debug: true    // Enables debugging output
});

// Example function to send an email
const sendNotification = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = { sendNotification };
