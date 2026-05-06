const API_URL = 'http://localhost:3000/tasks';
let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const tasksList = document.getElementById('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize Icons
lucide.createIcons();

// Fetch Tasks
async function fetchTasks() {
    try {
        const res = await fetch(API_URL);
        tasks = await res.json();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksList.innerHTML = '<div class="empty-state">Failed to load tasks. Is the server running?</div>';
    }
}

// Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    
    if (!title) return;
    
    const submitBtn = taskForm.querySelector('button');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader"></i>';
    lucide.createIcons();
    submitBtn.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to add task');
        }
        
        titleInput.value = '';
        descInput.value = '';
        await fetchTasks();
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalContent;
        lucide.createIcons();
        submitBtn.disabled = false;
    }
});

// Toggle Task Status
window.toggleTask = async function(id, completed) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });
        await fetchTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

// Delete Task
window.deleteTask = async function(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        await fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// Filter Tasks
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Render Tasks
function renderTasks() {
    tasksList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `<div class="empty-state">No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.</div>`;
        return;
    }
    
    filteredTasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask(${task.id}, ${task.completed})">
                <i data-lucide="check"></i>
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        tasksList.appendChild(card);
    });
    
    lucide.createIcons();
}

// Helper to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Init
fetchTasks();
