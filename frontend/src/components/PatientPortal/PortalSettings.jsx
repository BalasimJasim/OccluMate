import { useState, useEffect, useContext } from "react";
import { getPatientSettings, updatePatientSettings } from "../../api";
import { AuthContext } from "../context/authContext";

const PortalSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    reminderPreferences: {
      email: true,
      sms: false,
      appointmentReminder: 24,
      prescriptionReminder: true,
      documentNotifications: true,
    },
    communicationPreferences: {
      preferredMethod: "email",
      language: "en",
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [user?._id]);

  const fetchSettings = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await getPatientSettings();
      setSettings(response.data);
    } catch (error) {
      setError("Failed to load settings: " + error.message);
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updatePatientSettings(settings);
      setSuccess("Settings updated successfully");
    } catch (error) {
      setError("Failed to update settings: " + error.message);
      console.error("Error updating settings:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Portal Settings</h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Reminder Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderPreferences.email}
                onChange={(e) =>
                  handleChange("reminderPreferences", "email", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Email Reminders</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderPreferences.sms}
                onChange={(e) =>
                  handleChange("reminderPreferences", "sms", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">SMS Reminders</span>
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Appointment Reminder Time (hours before)
              </label>
              <select
                value={settings.reminderPreferences.appointmentReminder}
                onChange={(e) =>
                  handleChange(
                    "reminderPreferences",
                    "appointmentReminder",
                    Number(e.target.value)
                  )
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderPreferences.prescriptionReminder}
                onChange={(e) =>
                  handleChange(
                    "reminderPreferences",
                    "prescriptionReminder",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Prescription Reminders</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderPreferences.documentNotifications}
                onChange={(e) =>
                  handleChange(
                    "reminderPreferences",
                    "documentNotifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Document Notifications</span>
            </label>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Communication Preferences
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Communication Method
              </label>
              <select
                value={settings.communicationPreferences.preferredMethod}
                onChange={(e) =>
                  handleChange(
                    "communicationPreferences",
                    "preferredMethod",
                    e.target.value
                  )
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Language Preference
              </label>
              <select
                value={settings.communicationPreferences.language}
                onChange={(e) =>
                  handleChange(
                    "communicationPreferences",
                    "language",
                    e.target.value
                  )
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortalSettings;
