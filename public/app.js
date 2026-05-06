const API_URL = 'http://localhost:3000/tasks';
let tasks = [];
let currentFilter = 'all';
let currentPage = 1;
const limit = 10;
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const tasksList = document.getElementById('tasks-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const paginationControls = document.getElementById('pagination-controls');

// Initialize Icons
lucide.createIcons();

// Fetch Tasks
async function fetchTasks() {
    try {
        let url = `${API_URL}?page=${currentPage}&limit=${limit}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (currentFilter === 'active') url += '&completed=false';
        if (currentFilter === 'completed') url += '&completed=true';
        
        const res = await fetch(url);
        const response = await res.json();
        
        // Handle new response shape { data, meta }
        tasks = response.data || response;
        const meta = response.meta;
        
        renderTasks();
        
        if (meta) {
            updatePagination(meta);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksList.innerHTML = '<div class="empty-state">Failed to load tasks. Is the server running?</div>';
    }
}

// Update Pagination UI
function updatePagination(meta) {
    // Only show pagination if there's more than 1 page or we are not on page 1
    paginationControls.style.display = meta.totalPages > 1 || currentPage > 1 ? 'flex' : 'none';
    pageInfo.textContent = `Page ${meta.currentPage} of ${Math.max(1, meta.totalPages)}`;
    prevPageBtn.disabled = meta.currentPage <= 1;
    nextPageBtn.disabled = meta.currentPage >= meta.totalPages;
}

// Search Logic (Debounced)
let searchTimeout;
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1; // Reset to page 1 on new search
            fetchTasks();
        }, 300);
    });
}

// Pagination Event Listeners
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchTasks();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    fetchTasks();
});

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
        // Go back to page 1 to see the new task (if sorting defaults to newest, though here it appends to end. Just reloading for simplicity).
        fetchTasks();
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
        
        // Handle Edge case: Deleting last item on page > 1 should go to previous page
        if (tasks.length === 1 && currentPage > 1) {
            currentPage--;
        }
        
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
        currentPage = 1; // Reset to page 1 on filter change
        fetchTasks();
    });
});

// Render Tasks
function renderTasks() {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        let msg = 'No tasks found.';
        if (searchQuery) msg = `No results for "${searchQuery}".`;
        else if (currentFilter !== 'all') msg = `No ${currentFilter} tasks.`;
        
        tasksList.innerHTML = `<div class="empty-state">${msg}</div>`;
        return;
    }
    
    tasks.forEach((task, index) => {
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
