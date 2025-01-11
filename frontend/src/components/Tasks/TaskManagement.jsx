import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorMessage } from "../common/ErrorMessage";
import api from "../../api";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tasks");
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks. Please try again later.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await api.post("/tasks", taskData);
      setTasks([...tasks, response.data]);
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding task:", err);
      throw err;
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data : task))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2" /> Add New Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TaskList
          tasks={tasks}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </div>

      {showAddForm && (
        <TaskForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddTask}
        />
      )}
    </div>
  );
};

export default TaskManagement;
