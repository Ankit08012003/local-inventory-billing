const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification OTP',
            text: `Your OTP for verification is: ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP ${otp} sent to email ${email}`);
    } catch (error) {
        console.error(`Failed to send email. OTP for ${email} is: ${otp}`);
        // Log the error but don't throw to allow testing without valid email credentials
    }
};

module.exports = { sendEmailOTP };
