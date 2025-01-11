import { useState } from "react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Card from "../../common/Card";
import PropTypes from "prop-types";

const TaskForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    time: initialData?.time || "",
    priority: initialData?.priority || "Medium",
    status: initialData?.status || "Pending",
  });

  const priorityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Task" : "New Task"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Due Date"
            id="dueDate"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />

          <Input
            label="Time"
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />

          <Select
            label="Priority"
            id="priority"
            required
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            options={priorityOptions}
          />

          <Select
            label="Status"
            id="status"
            required
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            options={statusOptions}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

TaskForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    time: PropTypes.string,
    priority: PropTypes.oneOf(["High", "Medium", "Low"]),
    status: PropTypes.oneOf(["Pending", "In Progress", "Completed"]),
  }),
};

export default TaskForm;
