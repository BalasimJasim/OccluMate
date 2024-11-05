import express from 'express';
import sendSMS from '../utils/sendSMS.js';

const router = express.Router();

router.post('/test-sms', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Test data
    const testData = {
      date: '2024-03-20',
      timeSlot: '14:30',
      dentistName: 'Dr. Smith',
      cabinet: 'Cabinet-1'
    };

    const result = await sendSMS(phoneNumber, testData);
    
    if (result.success) {
      res.json({ 
        message: 'Test SMS sent successfully', 
        details: result 
      });
    } else {
      res.status(400).json({ 
        message: 'Failed to send test SMS', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error testing SMS', 
      error: error.message 
    });
  }
});

export default router; 