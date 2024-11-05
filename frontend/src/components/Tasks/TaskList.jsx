import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FaCheckCircle, FaHourglassHalf, FaExclamationCircle } from 'react-icons/fa';
import './TaskList.scss';

const TaskList = ({ tasks, onTaskUpdate, showAssignee = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'in-progress':
        return <FaHourglassHalf className="status-icon in-progress" />;
      case 'pending':
        return <FaExclamationCircle className="status-icon pending" />;
      default:
        return null;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks found</p>
      ) : (
        tasks.map(task => (
          <div key={task._id} className={`task-item ${task.status}`}>
            <div className="task-header">
              <div className="task-status">
                {getStatusIcon(task.status)}
                <span className={`priority ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              {showAssignee && (
                <div className="task-assignee">
                  Assigned to: {task.assignedTo.name}
                </div>
              )}
            </div>

            <div className="task-content">
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span className="due-date">
                  Due: {moment(task.dueDate).format('MMM D, YYYY')}
                </span>
                {task.relatedTo && (
                  <span className="related-to">
                    {task.relatedTo.type}: {task.relatedTo.name}
                  </span>
                )}
              </div>
            </div>

            <div className="task-actions">
              {task.status !== 'completed' && (
                <button
                  className="btn complete"
                  onClick={() => handleStatusChange(task._id, 'completed')}
                >
                  Mark Complete
                </button>
              )}
              {task.status === 'pending' && (
                <button
                  className="btn start"
                  onClick={() => handleStatusChange(task._id, 'in-progress')}
                >
                  Start Task
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    assignedTo: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    relatedTo: PropTypes.shape({
      type: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  })).isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  showAssignee: PropTypes.bool
};

export default TaskList; 