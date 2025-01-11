import { useState } from "react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Card from "../../common/Card";

const AppointmentForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || "",
    patientEmail: initialData?.patientEmail || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    type: initialData?.type || "check-up",
    notes: initialData?.notes || "",
  });

  const appointmentTypes = [
    { value: "check-up", label: "Check-up" },
    { value: "cleaning", label: "Cleaning" },
    { value: "procedure", label: "Procedure" },
    { value: "emergency", label: "Emergency" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Appointment" : "New Appointment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Patient Name"
            id="patientName"
            required
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
          />

          <Input
            label="Patient Email"
            id="patientEmail"
            type="email"
            required
            value={formData.patientEmail}
            onChange={(e) =>
              setFormData({ ...formData, patientEmail: e.target.value })
            }
          />

          <Input
            label="Date"
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <Input
            label="Time"
            id="time"
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />

          <Select
            label="Appointment Type"
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={appointmentTypes}
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Appointment" : "Create Appointment"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AppointmentForm;
