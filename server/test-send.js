require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS || 'noreply@interviu.ai',
      to: 'test3@example.com',
      subject: 'Test Subject',
      text: 'Test Body'
    });
    console.log('Send: SUCCESS', info.messageId);
  } catch (err) {
    console.log('Send: FAILED', err.message);
  }
}

test();
