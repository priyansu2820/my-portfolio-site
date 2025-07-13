// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // NEW: Import nodemailer
require('dotenv').config(); // NEW: Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to serve static files from the current directory
app.use(express.static(__dirname));

// Configure Nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'Outlook', 'SendGrid', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS  // Your email password or App Password from .env
    }
});

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST endpoint for contact form submissions
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation (optional but good practice)
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Email content
    const mailOptions = {
        from: `"${name}" <${email}>`, // Sender's name and email from the form
        to: process.env.EMAIL_USER, // Your email address where you want to receive messages
        subject: `New Contact from Portfolio: ${name}`,
        html: `
            <p>You have a new contact message from your portfolio website:</p>
            <h3>Contact Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
            </ul>
            <h3>Message:</h3>
            <p>${message}</p>
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email from contact form:', error);
            // Log more details if available
            if (error.response) {
                console.error('Nodemailer response:', error.response);
            }
            if (error.code) {
                console.error('Nodemailer error code:', error.code);
            }
            if (error.command) {
                console.error('Nodemailer command:', error.command);
            }
            // Send a more generic error message to the client for security
            return res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
        console.log('Message sent from contact form: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Only for ethereal.email, won't work with real Gmail
        res.status(200).json({ message: 'Message sent successfully!' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('To stop the server, press Ctrl+C');
});