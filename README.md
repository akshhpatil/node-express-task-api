# Node.js Express Task API

This is a simple backend application that manages a list of tasks, demonstrating basic CRUD (Create, Read, Update, Delete) operations using Node.js and Express.js.

This project was built as a demo task for the Full Stack Engineer assessment at Zeonix Global Pvt. Ltd.

## Features
- **RESTful API**: Clean API endpoints for interacting with tasks.
- **In-Memory/File Data Storage**: Uses a lightweight local `tasks.json` file for data persistence.
- **Input Validation**: Ensures required fields like `title` are present during creation.
- **Built-in UI Tester**: Includes a lightweight, vanilla HTML/JS frontend to test the API directly without needing external tools.

## Prerequisites
- [Node.js](https://nodejs.org/) installed (v14 or higher recommended).

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/akshhpatil/node-express-task-api.git
   ```
2. Navigate into the project directory:
   ```bash
   cd node-express-task-api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the server, run the following command:
```bash
node server.js
```

The server will start on `http://localhost:3000`.

## Testing the API

### Method 1: Using the Built-in Frontend (Recommended)
Once the server is running, simply open your browser and navigate to:
**http://localhost:3000**
This will load a simple web interface built to test all CRUD operations interactively.

### Method 2: Using API Endpoints directly (Postman / cURL)

| Method | Endpoint | Description | Request Body (JSON) |
|---|---|---|---|
| GET | `/tasks` | Get all tasks | none |
| GET | `/tasks/:id` | Get a single task by ID | none |
| POST | `/tasks` | Create a new task | `{"title": "Task 1", "description": "Desc"}` |
| PUT | `/tasks/:id` | Update an existing task | `{"completed": true}` (or `title`/`description`) |
| DELETE | `/tasks/:id` | Delete a task | none |

## Design Decisions
- **Data Storage**: Instead of just using an in-memory array that wipes upon server restart, I chose to implement file-system storage (`data/tasks.json`). This satisfies the "lightweight" requirement but adds a touch of robustness so data persists.
- **Vanilla Frontend**: Included an `index.html` frontend within the `public` folder to make it trivially easy for the reviewer to test the app without having to import Postman collections.
- **Validation**: Added basic validation on the `POST` route to ensure empty or invalid tasks cannot be created.
- **Frameworks**: Kept it strictly to Express and standard Node modules (`fs`, `path`) to keep the footprint as small as possible per requirements.