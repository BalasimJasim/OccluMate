import { useState } from "react";
import PropTypes from "prop-types";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import TaskEditModal from "./TaskEditModal";

const TaskList = ({ tasks, onUpdate, onDelete }) => {
  const [editingTask, setEditingTask] = useState(null);

  const handleStatusChange = (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    onUpdate(taskId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!tasks.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No tasks found. Create a new task to get started.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4 flex-grow">
            <button
              onClick={() => handleStatusChange(task._id, task.status)}
              className={`p-2 rounded-full transition-colors duration-200 hover:bg-opacity-80 ${
                task.status === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <FaCheck className="w-4 h-4" />
            </button>
            <div className="flex-grow">
              <h3
                className={`text-lg font-medium ${
                  task.status === "completed"
                    ? "text-gray-500 line-through"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingTask(task)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={(updates) => {
            onUpdate(editingTask._id, updates);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TaskList;
