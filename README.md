# 🚀 Taskflow - Full-Stack Task Management API

A robust, feature-rich task management REST API built with Node.js and Express, coupled with a highly polished, modern vanilla JS frontend dashboard.

This project was engineered to demonstrate clean architecture, robust data validation, and modern UI/UX principles for a Full Stack Engineer assessment.

## ✨ Key Technical Highlights

### Backend Engineering (Node.js & Express)
- **Advanced Querying**: Fully implemented server-side **Pagination**, **Search**, and **Filtering** logic to simulate real-world database queries.
- **Robust Validation**: Integrated **Joi** schema validation for all incoming POST and PUT requests to ensure data integrity, return descriptive error messages, and prevent malformed data.
- **Data Persistence**: Built a lightweight data persistence layer using `fs` to read/write JSON, ensuring data isn't lost on server restart while adhering to zero-database assessment requirements.
- **RESTful Design**: Adheres strictly to REST API conventions (`GET`, `POST`, `PUT`, `DELETE`) with precise HTTP status codes (200, 201, 204, 400, 404).

### Frontend UI/UX (Vanilla HTML/CSS/JS)
- **Modern SaaS Dashboard**: A responsive, full-screen dashboard layout avoiding generic, out-of-the-box boilerplate designs.
- **Premium Aesthetics**: Utilizes advanced CSS techniques including glassmorphism (backdrop filters), custom animated background blobs, and sleek micro-animations.
- **Asynchronous Data Handling**: Fully reactive frontend utilizing the `Fetch API` for seamless, page-reload-free interactions.
- **Optimized UX**: Features debounced live searching, dynamic pagination controls, and error boundaries.

---

## 🛠️ Setup & Installation

**Prerequisites:** [Node.js](https://nodejs.org/) installed (v14+ recommended).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akshhpatil/node-express-task-api.git
   cd node-express-task-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(Dependencies include `express`, `cors`, `joi`, and `nodemon` for local development).*

3. **Start the server:**
   ```bash
   npm start
   ```

---

## 💻 Live Demonstration

The easiest and best way to review this project is through the integrated frontend!

Once the server is running, navigate to:
**👉 http://localhost:3000**

You can immediately test adding tasks, searching, toggling completion, deleting, and paginating through results.

---

## 🔗 API Documentation

If you prefer testing via Postman or cURL, the endpoints are fully documented below:

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| GET | `/tasks` | `?page=1&limit=10`<br>`?search=text`<br>`?completed=true` | Fetch tasks (supports pagination, search, and filtering) |
| GET | `/tasks/:id` | none | Fetch a single task by ID |
| POST | `/tasks` | none | Create a task. Body: `{"title": "string (min 3)", "description": "string"}` |
| PUT | `/tasks/:id` | none | Update a task. Body accepts partial updates. |
| DELETE | `/tasks/:id` | none | Delete a task. |

**Example Search & Pagination Request:**
```http
GET http://localhost:3000/tasks?search=demo&page=1&limit=5&completed=false
```

---

## 🏗️ Architectural Decisions

- **Why Joi?** Manual `if/else` validation scales poorly. Joi provides a declarative, strictly typed schema that instantly hardens the API against bad actors.
- **Why Vanilla JS for the Frontend?** To demonstrate a deep, fundamental understanding of the DOM, Event Loop, and Fetch API without hiding behind abstractions like React or Vue for a simple demo.
- **Why Server-Side Pagination?** While client-side pagination works for small arrays, true production APIs must paginate at the server layer to minimize bandwidth overhead and memory footprint. This project implements production-ready server-side slicing.