
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Define the email options
    const mailOptions = {
        from: process.env.SMTP_FROM, // Sender address
        to: options.email, // List of recipients
        subject: options.subject, // Subject line
        html: options.message, // HTML body content
        // You can also include attachments, text, and other fields if needed
    };

    // Send mail with defined transport object
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email Sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
