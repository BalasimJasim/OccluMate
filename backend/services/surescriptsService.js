import axios from 'axios';
import { encrypt } from './encryptionService.js';

class SurescriptsService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.SURESCRIPTS_API_URL,
      headers: {
        'Authorization': `Bearer ${process.env.SURESCRIPTS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendPrescription(prescriptionData) {
    try {
      // Encrypt sensitive data before transmission
      const encryptedData = await encrypt(prescriptionData);

      const response = await this.api.post('/prescriptions', {
        prescriptionData: encryptedData,
        metadata: {
          clinicId: process.env.CLINIC_ID,
          timestamp: new Date().toISOString()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Surescripts API error:', error);
      throw new Error('Failed to send prescription to pharmacy');
    }
  }

  async checkPharmacyStatus(pharmacyId) {
    try {
      const response = await this.api.get(`/pharmacies/${pharmacyId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking pharmacy status:', error);
      throw error;
    }
  }
}

export default new SurescriptsService(); 