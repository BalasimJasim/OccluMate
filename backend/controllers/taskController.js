// controllers/taskController.js

import Task from '../models/Task.js';

// Create a task
export const createTask = async (req, res) => {
  const { title, description, assignedTo, dueDate } = req.body;

  try {
    const task = new Task({ title, description, assignedTo, dueDate });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks assigned to a user
export const getTasksByUser = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodaysTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s tasks', error: error.message });
  }
};
