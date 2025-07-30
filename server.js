// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage (in real apps, use a database)
let tasks = [
  {
    id: 1,
    title: "Learn Node.js",
    description: "Complete Node.js tutorial",
    status: "pending",
    priority: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Build API",
    description: "Create REST API for task management",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 3;

// Helper function to find task by ID
const findTaskById = (id) => {
  return tasks.find(task => task.id === parseInt(id));
};

// Routes

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
  const { status, priority } = req.query;
  
  let filteredTasks = tasks;
  
  // Filter by status if provided
  if (status) {
    filteredTasks = filteredTasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase()
    );
  }
  
  // Filter by priority if provided
  if (priority) {
    filteredTasks = filteredTasks.filter(task => 
      task.priority.toLowerCase() === priority.toLowerCase()
    );
  }
  
  res.json({
    success: true,
    count: filteredTasks.length,
    data: filteredTasks
  });
});

// GET /api/tasks/:id - Get single task
app.get('/api/tasks/:id', (req, res) => {
  const task = findTaskById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  res.json({
    success: true,
    data: task
  });
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium' } = req.body;
  
  // Validation
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }
  
  if (!['low', 'medium', 'high'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be: low, medium, or high'
    });
  }
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    status: 'pending',
    priority: priority.toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  const task = findTaskById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  const { title, description, status, priority } = req.body;
  
  // Validation
  if (status && !['pending', 'in-progress', 'completed'].includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Status must be: pending, in-progress, or completed'
    });
  }
  
  if (priority && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be: low, medium, or high'
    });
  }
  
  // Update task fields
  if (title) task.title = title.trim();
  if (description) task.description = description.trim();
  if (status) task.status = status.toLowerCase();
  if (priority) task.priority = priority.toLowerCase();
  task.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(task => task.id === parseInt(req.params.id));
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Task deleted successfully',
    data: deletedTask
  });
});

// GET /api/stats - Get task statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    }
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /api/tasks`);
  console.log(`   GET    /api/tasks/:id`);
  console.log(`   POST   /api/tasks`);
  console.log(`   PUT    /api/tasks/:id`);
  console.log(`   DELETE /api/tasks/:id`);
  console.log(`   GET    /api/stats`);
});

// Export for testing
module.exports = app;