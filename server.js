const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Joi Validation Schemas
const taskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().allow('').optional(),
    completed: Joi.boolean().optional()
});

const taskUpdateSchema = Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().allow('').optional(),
    completed: Joi.boolean().optional()
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // For testing the API with the provided frontend

// Helper function to read tasks from file
const getTasks = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
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
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
};

// 1. GET /tasks: Returns a list of all tasks.
app.get('/tasks', (req, res) => {
    let tasks = getTasks();
    
    // Filter
    if (req.query.completed !== undefined) {
        const isCompleted = req.query.completed === 'true';
        tasks = tasks.filter(t => t.completed === isCompleted);
    }
    
    // Search
    const search = req.query.search;
    if (search) {
        const lowerCaseSearch = search.toLowerCase();
        tasks = tasks.filter(t => 
            t.title.toLowerCase().includes(lowerCaseSearch) || 
            (t.description && t.description.toLowerCase().includes(lowerCaseSearch))
        );
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    res.json({
        data: paginatedTasks,
        meta: {
            totalItems: tasks.length,
            currentPage: page,
            totalPages: Math.ceil(tasks.length / limit),
            itemsPerPage: limit
        }
    });
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
    // Validate request body against Joi schema
    const { error, value } = taskSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    const tasks = getTasks();
    
    // Generate unique ID (incrementing number)
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const newTask = {
        id: newId,
        title: value.title,
        description: value.description || '',
        completed: value.completed || false
    };
    
    tasks.push(newTask);
    saveTasks(tasks);
    
    res.status(201).json(newTask);
});

// 4. PUT /tasks/:id: Updates an existing task.
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // Validate request body against Joi schema
    const { error, value } = taskUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task properties if provided
    if (value.title !== undefined) tasks[taskIndex].title = value.title;
    if (value.description !== undefined) tasks[taskIndex].description = value.description;
    if (value.completed !== undefined) tasks[taskIndex].completed = value.completed;
    
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
