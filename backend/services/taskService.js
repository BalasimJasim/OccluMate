import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendNotification } from './notificationService.js';
import moment from 'moment';

class TaskService {
  async createRescheduleTask(appointment, reason = '') {
    try {
      // Find available receptionist or admin
      const assignee = await User.findOne({
        role: { $in: ['Receptionist', 'Admin'] },
        isActive: true
      });

      if (!assignee) {
        throw new Error('No available staff to assign task');
      }

      const task = await Task.create({
        type: 'reschedule',
        priority: 'high',
        description: `Reschedule appointment for ${appointment.patientName}`,
        assignedTo: assignee._id,
        dueDate: moment().add(1, 'day').toDate(),
        status: 'pending',
        relatedTo: {
          type: 'appointment',
          id: appointment._id
        },
        notes: reason ? `Reason for reschedule: ${reason}` : ''
      });

      // Send notification to assignee
      await sendNotification({
        userId: assignee._id,
        title: 'New Reschedule Task',
        message: `You have been assigned to reschedule an appointment for ${appointment.patientName}`,
        type: 'task',
        data: {
          taskId: task._id,
          appointmentId: appointment._id
        }
      });

      return task;
    } catch (error) {
      console.error('Error creating reschedule task:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId, status, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
        task.completedBy = userId;
      }

      await task.save();

      // Notify task creator if task is completed
      if (status === 'completed') {
        await sendNotification({
          userId: task.assignedTo,
          title: 'Task Completed',
          message: `Task "${task.description}" has been completed`,
          type: 'task_update',
          data: { taskId: task._id }
        });
      }

      return task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async getTasksByUser(userId, status = null, limit = 10) {
    try {
      const query = { assignedTo: userId };
      if (status) {
        query.status = status;
      }

      const tasks = await Task.find(query)
        .sort({ dueDate: 1, priority: -1 })
        .limit(limit)
        .populate('relatedTo.id')
        .populate('assignedTo', 'name email');

      return tasks;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  }

  async getOverdueTasks() {
    try {
      const tasks = await Task.find({
        status: 'pending',
        dueDate: { $lt: new Date() }
      })
        .populate('assignedTo', 'name email')
        .sort({ dueDate: 1 });

      // Send reminders for overdue tasks
      for (const task of tasks) {
        await sendNotification({
          userId: task.assignedTo._id,
          title: 'Overdue Task',
          message: `Task "${task.description}" is overdue`,
          type: 'task_overdue',
          data: { taskId: task._id }
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      throw error;
    }
  }
}

export default new TaskService(); 