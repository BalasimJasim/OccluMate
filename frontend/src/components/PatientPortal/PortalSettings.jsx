import React, { useState, useEffect, useContext } from 'react';
import { getPatientSettings, updatePatientSettings } from '../../api';
import './PortalSettings.scss';
import { AuthContext } from '../context/authContext';

const PortalSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    reminderPreferences: {
      email: true,
      sms: false,
      appointmentReminder: 24,
      prescriptionReminder: true,
      documentNotifications: true
    },
    communicationPreferences: {
      preferredMethod: 'email',
      language: 'en'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [user?._id]);

  const fetchSettings = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await getPatientSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updatePatientSettings(settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="portal-settings">
      <h2>Portal Settings</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>Reminder Preferences</h3>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reminderPreferences.email}
                onChange={(e) => handleChange('reminderPreferences', 'email', e.target.checked)}
              />
              Email Reminders
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reminderPreferences.sms}
                onChange={(e) => handleChange('reminderPreferences', 'sms', e.target.checked)}
              />
              SMS Reminders
            </label>
          </div>

          <div className="form-group">
            <label>Appointment Reminder Time (hours before)</label>
            <select
              value={settings.reminderPreferences.appointmentReminder}
              onChange={(e) => handleChange('reminderPreferences', 'appointmentReminder', Number(e.target.value))}
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reminderPreferences.prescriptionReminder}
                onChange={(e) => handleChange('reminderPreferences', 'prescriptionReminder', e.target.checked)}
              />
              Prescription Reminders
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.reminderPreferences.documentNotifications}
                onChange={(e) => handleChange('reminderPreferences', 'documentNotifications', e.target.checked)}
              />
              Document Notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Communication Preferences</h3>
          
          <div className="form-group">
            <label>Preferred Communication Method</label>
            <select
              value={settings.communicationPreferences.preferredMethod}
              onChange={(e) => handleChange('communicationPreferences', 'preferredMethod', e.target.value)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label>Language Preference</label>
            <select
              value={settings.communicationPreferences.language}
              onChange={(e) => handleChange('communicationPreferences', 'language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortalSettings;