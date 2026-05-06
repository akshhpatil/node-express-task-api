const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // For testing the API with the provided frontend

// Helper function to read tasks from file
const getTasks = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading tasks:", error);
        return [];
    }
};

// Helper function to save tasks to file
const saveTasks = (tasks) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
};

// 1. GET /tasks: Returns a list of all tasks.
app.get('/tasks', (req, res) => {
    const tasks = getTasks();
    res.json(tasks);
});

// 2. GET /tasks/:id: Returns a single task by ID.
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
});

// 3. POST /tasks: Creates a new task.
app.post('/tasks', (req, res) => {
    const { title, description, completed } = req.body;
    
    // Validation
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required and must be a string' });
    }
    
    const tasks = getTasks();
    
    // Generate unique ID (incrementing number)
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const newTask = {
        id: newId,
        title,
        description: description || '',
        completed: typeof completed === 'boolean' ? completed : false
    };
    
    tasks.push(newTask);
    saveTasks(tasks);
    
    res.status(201).json(newTask);
});

// 4. PUT /tasks/:id: Updates an existing task.
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, completed } = req.body;
    
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task properties if provided
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (completed !== undefined) tasks[taskIndex].completed = completed;
    
    saveTasks(tasks);
    
    res.json(tasks[taskIndex]);
});

// 5. DELETE /tasks/:id: Deletes a task by ID.
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = getTasks();
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    // Remove task
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);
    
    res.status(204).send(); // 204 No Content
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
