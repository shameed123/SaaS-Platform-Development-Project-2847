const nodemailer = require('nodemailer');

// Theme colors - matching the frontend theme
const THEME_COLORS = {
  warm500: '#ff5681',  // Primary warm color
  soft500: '#f08b3e',  // Primary soft color
  warm600: '#e4436b',  // Darker warm for hover states
  soft600: '#d3742c',  // Darker soft for hover states
  warm50: '#fff5f7',   // Light warm background
  soft50: '#fff7f0',   // Light soft background
  gray50: '#f9fafb',   // Light gray background
  gray100: '#f3f4f6',  // Slightly darker gray
  gray300: '#d1d5db',  // Border gray
  gray600: '#4b5563',  // Text gray
  gray700: '#374151',  // Darker text
  gray800: '#1f2937',  // Very dark text
  gray900: '#111827',  // Darkest text
  white: '#ffffff',
  black: '#000000'
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send invitation email
const sendInvitationEmail = async (email, invitationToken, companyName, inviterName) => {
  try {
    const transporter = createTransporter();
    
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4100'}/#/invite?token=${invitationToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'SaaS Platform'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `You've been invited to join ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${THEME_COLORS.warm500} 0%, ${THEME_COLORS.soft500} 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Join ${companyName} on our platform</p>
          </div>
          
          <div style="padding: 30px; background: ${THEME_COLORS.gray50};">
            <h2 style="color: ${THEME_COLORS.gray800}; margin-bottom: 20px;">Hello!</h2>
            <p style="color: ${THEME_COLORS.gray600}; line-height: 1.6; margin-bottom: 20px;">
              ${inviterName} has invited you to join <strong>${companyName}</strong> on our SaaS platform.
            </p>
            
            <div style="background: ${THEME_COLORS.white}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${THEME_COLORS.warm500};">
              <p style="margin: 0; color: ${THEME_COLORS.gray800};">
                <strong>What you'll get:</strong>
              </p>
              <ul style="color: ${THEME_COLORS.gray600}; margin: 10px 0;">
                <li>Access to company resources and tools</li>
                <li>Collaborate with your team members</li>
                <li>Manage your projects and tasks</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background: linear-gradient(135deg, ${THEME_COLORS.warm500} 0%, ${THEME_COLORS.soft500} 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(255, 86, 129, 0.4);">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: ${THEME_COLORS.gray600}; font-size: 14px; margin-top: 30px;">
              This invitation will expire in 7 days. If you have any questions, please contact your administrator.
            </p>
          </div>
          
          <div style="background: ${THEME_COLORS.gray800}; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4100'}/#/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'SaaS Platform'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${THEME_COLORS.warm500} 0%, ${THEME_COLORS.soft500} 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset your account password</p>
          </div>
          
          <div style="padding: 30px; background: ${THEME_COLORS.gray50};">
            <h2 style="color: ${THEME_COLORS.gray800}; margin-bottom: 20px;">Hello!</h2>
            <p style="color: ${THEME_COLORS.gray600}; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, ${THEME_COLORS.warm500} 0%, ${THEME_COLORS.soft500} 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(255, 86, 129, 0.4);">
                Reset Password
              </a>
            </div>
            
            <p style="color: ${THEME_COLORS.gray600}; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background: ${THEME_COLORS.gray800}; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send general email
const sendEmail = async (to, subject, message, from = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || `"${process.env.EMAIL_FROM_NAME || 'SaaS Platform'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${THEME_COLORS.warm500} 0%, ${THEME_COLORS.soft500} 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          
          <div style="padding: 30px; background: ${THEME_COLORS.gray50};">
            <div style="background: ${THEME_COLORS.white}; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message}
            </div>
          </div>
          
          <div style="background: ${THEME_COLORS.gray800}; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendInvitationEmail,
  sendPasswordResetEmail,
  sendEmail
}; 