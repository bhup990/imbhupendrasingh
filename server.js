const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const bodyParser = require('body-parser'); // To parse form data

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

// Endpoint to serve the form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

// Endpoint to handle the POST request
app.post('/send-email', async (req, res) => {
    const formData = req.body;

    try {
        // 1. Setup Email Transporter (configure your email service)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your specific email provider
            auth: {
                user: 'your_email@gmail.com',  // Your email address
                pass: 'your_email_password', // Your email password or app password
            },
        });

        // 2. Read the HTML File and Compile with Handlebars
        const htmlContent = await fs.readFile('email_template.html', 'utf-8');
        const template = handlebars.compile(htmlContent);

        // 3. Prepare Template Data
        const templateData = {
            name: formData.name,
            message: formData.message,
            email: formData.email
        };
        const emailHtml = template(templateData);

        // 4. Create Email Options
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: 'recipient_email@example.com', // Recipient's email (you can make it admin email)
            subject: 'New Contact Form Submission',
            html: emailHtml,
        };

        // 5. Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        // Send success response
        res.json({ success: true });

    } catch (error) {
        console.error('Error sending email:', error);
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});