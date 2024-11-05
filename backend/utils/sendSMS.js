import twilio from 'twilio';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async (to, data) => {
  try {
    // Check if Twilio is properly configured
    if (!client) {
      logger.warn('SMS not sent - Twilio not configured:', { to, data });
      return {
        success: false,
        message: 'SMS service not configured'
      };
    }

    // Format the message
    const message = `OccluMate Dental: Your appointment is scheduled for ${data.date} at ${data.timeSlot} with Dr. ${data.dentistName}. Cabinet: ${data.cabinet}`;

    // Send the SMS
    const response = await client.messages.create({
      body: message,
      to: to,  // Recipient's phone number
      from: TWILIO_PHONE_NUMBER
    });

    logger.info('SMS sent successfully', {
      to,
      messageId: response.sid,
      status: response.status
    });

    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };

  } catch (error) {
    logger.error('SMS sending failed', {
      to,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message
    };
  }
};

export default sendSMS;