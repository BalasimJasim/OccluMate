import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getTodaysTasks, updateTask, createTask } from '../../api';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import './TaskManagement.scss';
import { FaPlus } from 'react-icons/fa';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTodaysTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (err) {
      setError('Failed to update task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const response = await createTask(taskData);
      setTasks(prev => [...prev, response.data]);
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to create task');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="task-management">
      <div className="task-header">
        <h1>Task Management</h1>
        <button 
          className="btn add-task"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> New Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="task-sections">
        <div className="task-section">
          <h2>My Tasks</h2>
          <TaskList
            tasks={tasks.filter(task => task.assignedTo === user._id)}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>

        {user.role === 'Admin' && (
          <div className="task-section">
            <h2>All Tasks</h2>
            <TaskList
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              showAssignee
            />
          </div>
        )}
      </div>

      {showAddForm && (
        <TaskForm
          onSubmit={handleTaskCreate}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default TaskManagement; 