const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();

  if (user && pass) {
    // If Gmail account or explicitly requested Gmail service
    if (process.env.EMAIL_SERVICE === 'gmail' || user.toLowerCase().endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass // 16-character Google App Password
        }
      });
    }

    // Generic Custom SMTP host/port
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user, pass }
    });
  }
  return null;
};

const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const subject = purpose === 'register' 
    ? 'CareerBridgeAI - Verify Your Email (OTP)' 
    : 'CareerBridgeAI - Your Login Verification Code';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CareerBridgeAI</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">AI-Powered Job & Placement Ecosystem</p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Hello,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
          Use the following 6-digit one-time verification code for <strong>${purpose === 'register' ? 'account registration' : 'instant account login'}</strong>:
        </p>
        
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); padding: 20px; text-align: center; border-radius: 12px; border: 1px solid #e0e7ff; margin: 20px 0;">
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #4338ca; font-family: monospace;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 16px 0 0 0;">
          ⏱️ This verification code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} CareerBridgeAI. If you did not request this email, please ignore it.
        </p>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  let emailSent = false;
  let emailError = null;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"CareerBridgeAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html
      });
      console.log(`✅ [Email Service] Real OTP successfully sent to: ${email}`);
      emailSent = true;
    } catch (err) {
      console.error(`❌ [Email Service Error]: ${err.message}`);
      emailError = err.message;
    }
  }

  // Always log OTP to server console
  console.log(`====================================================`);
  console.log(`📨 [OTP Dispatch] Recipient: ${email}`);
  console.log(`🎯 Purpose: ${purpose.toUpperCase()}`);
  console.log(`🔑 Verification Code: >>> ${otp} <<<`);
  console.log(`📬 Real Email Sent: ${emailSent ? 'YES (Delivered to inbox)' : 'NO (Email credentials not configured or error: ' + (emailError || 'EMAIL_USER is empty in .env') + ')'}`);
  console.log(`====================================================`);

  return { emailSent, emailError };
};

module.exports = { sendOTPEmail };
