import { useState } from "react";
import { FaPlus, FaSearch, FaCheck, FaClock, FaTimes } from "react-icons/fa";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import Table from "../../common/Table";
import PropTypes from "prop-types";

const TaskList = ({ tasks = [], onStatusChange, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const taskColumns = [
    {
      key: "title",
      header: "Task",
      render: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => (
        <div className="text-sm">
          <div>{row.dueDate}</div>
          <div className="text-gray-500">{row.time}</div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <Badge
          variant={
            row.priority === "High"
              ? "danger"
              : row.priority === "Medium"
              ? "warning"
              : "info"
          }
        >
          {row.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Completed"
              ? "success"
              : row.status === "In Progress"
              ? "primary"
              : "warning"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          {row.status !== "Completed" && (
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onStatusChange(row.id, "Completed")}
            >
              <FaCheck className="w-4 h-4 text-success" />
            </Button>
          )}
          {row.status === "Pending" && (
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onStatusChange(row.id, "In Progress")}
            >
              <FaClock className="w-4 h-4 text-primary" />
            </Button>
          )}
          <Button
            variant="danger"
            className="p-2"
            onClick={() => onDelete(row.id)}
          >
            <FaTimes className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        <Button>
          <FaPlus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <Table columns={taskColumns} data={tasks} />
      </Card>
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      dueDate: PropTypes.string.isRequired,
      time: PropTypes.string,
      priority: PropTypes.oneOf(["High", "Medium", "Low"]).isRequired,
      status: PropTypes.oneOf(["Pending", "In Progress", "Completed"])
        .isRequired,
    })
  ),
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TaskList;
