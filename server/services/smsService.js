/**
 * Real SMS Dispatch Service for CareerBridgeAI
 * Sends real SMS to mobile numbers via Twilio or Fast2SMS gateway.
 */

const sendMobileOTP = async (phone, otp, purpose = 'login') => {
  const cleanPhone = phone.toString().trim();
  const actionText = purpose === 'register' ? 'Account Registration' : 'Account Login';
  const messageBody = `[CareerBridgeAI] Your verification code for ${actionText} is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

  // 1. Format Phone Number to International E.164 Format
  const digits = cleanPhone.replace(/\D/g, '');
  let formattedPhone = cleanPhone;

  if (digits.length === 10) {
    formattedPhone = `+91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    formattedPhone = `+91${digits.slice(1)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    formattedPhone = `+${digits}`;
  } else if (!cleanPhone.startsWith('+')) {
    formattedPhone = `+${digits}`;
  }

  let smsSent = false;
  let smsError = null;

  // 2. Try Twilio Gateway
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID.trim() !== '' &&
    process.env.TWILIO_AUTH_TOKEN.trim() !== '' &&
    process.env.TWILIO_PHONE_NUMBER.trim() !== ''
  );

  if (hasTwilio) {
    try {
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID.trim(),
        process.env.TWILIO_AUTH_TOKEN.trim()
      );

      const twilioRes = await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER.trim(),
        to: formattedPhone
      });

      console.log(`✅ [Twilio SMS] Real SMS delivered to ${formattedPhone}, Message SID: ${twilioRes.sid}`);
      smsSent = true;
    } catch (err) {
      console.error(`❌ [Twilio SMS Error]: ${err.message}`);
      smsError = `Twilio Error: ${err.message}`;
    }
  }

  // 3. Fallback to Fast2SMS (Indian Gateway)
  const hasFast2SMS = Boolean(
    process.env.FAST2SMS_API_KEY &&
    process.env.FAST2SMS_API_KEY.trim() !== ''
  );

  if (!smsSent && hasFast2SMS) {
    try {
      const last10Digits = digits.slice(-10);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: last10Digits
        })
      });

      const data = await response.json();
      if (data.return) {
        console.log(`✅ [Fast2SMS] Real SMS delivered to ${formattedPhone}`);
        smsSent = true;
      } else {
        smsError = data.message || 'Fast2SMS dispatch failed';
      }
    } catch (err) {
      console.error(`❌ [Fast2SMS Error]: ${err.message}`);
      smsError = `Fast2SMS Error: ${err.message}`;
    }
  }

  // 4. Neither gateway configured
  if (!hasTwilio && !hasFast2SMS) {
    smsError = 'SMS Gateway (Twilio) is not configured in server/.env. Please provide TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to deliver SMS to mobile numbers.';
  }

  console.log(`====================================================`);
  console.log(`📱 [Mobile OTP Dispatch] Mobile: ${formattedPhone}`);
  console.log(`🎯 Purpose: ${purpose.toUpperCase()}`);
  console.log(`🔑 Verification Code: >>> ${otp} <<<`);
  console.log(`📡 Real SMS Gateway Status: ${smsSent ? 'SENT TO PHONE' : 'FAILED: ' + smsError}`);
  console.log(`====================================================`);

  return { smsSent, smsError, formattedPhone };
};

module.exports = { sendMobileOTP };
