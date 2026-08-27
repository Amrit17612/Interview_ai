const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  
  if (!resend) {
    console.warn('\n============================================================');
    console.warn('DEVELOPMENT ONLY: EMAIL PROVIDER NOT CONFIGURED');
    console.warn(`To: ${email}`);
    console.warn(`Subject: Verify Your Email`);
    console.warn(`Link: ${verificationUrl}`);
    console.warn('============================================================\n');
    return false; // Indicating delivery was not executed
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'Interviu AI <noreply@interviu.ai>',
      to: email,
      subject: 'Verify your Interviu AI account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Interviu AI!</h2>
          <p>Your account has been successfully created. Please verify your email address to get started.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email Address</a>
          <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
          <p style="font-size: 12px; color: #666;">If you cannot click the button, copy and paste this URL into your browser: ${verificationUrl}</p>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL SERVICE] Resend API error:', error);
      throw new Error('Email delivery failed');
    }

    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send verification email:', error.message);
    throw new Error('Email delivery failed');
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  
  if (!resend) {
    console.warn('\n============================================================');
    console.warn('DEVELOPMENT ONLY: EMAIL PROVIDER NOT CONFIGURED');
    console.warn(`To: ${email}`);
    console.warn(`Subject: Password Reset Request`);
    console.warn(`Link: ${resetUrl}`);
    console.warn('============================================================\n');
    return false; // Indicating delivery was not executed
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'Interviu AI <noreply@interviu.ai>',
      to: email,
      subject: 'Reset your Interviu AI password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Interviu AI Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to choose a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 12px; color: #666;">This link will expire in 30 minutes. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL SERVICE] Resend API error:', error);
      throw new Error('Email delivery failed');
    }

    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send password reset email:', error.message);
    throw new Error('Email delivery failed');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
