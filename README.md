# Doctor Management Module - LNMIIT Health Center 🏥

A full-stack web application module built for the **LNMIIT Health Center Management System**. This module is designed to cleanly and efficiently manage the hospital's roster of doctors, including their specializations, availability, and contact details.

## 🚀 Features

- **Dashboard Overview:** Quick statistics and a glance at available doctors.
- **Add & Manage Doctors:** Add new doctors to the system with their specific availability days and consultation timings.
- **Edit/Delete Profiles:** Update existing doctor information or remove profiles entirely.
- **Specialization Search:** Filter doctors dynamically based on their specific domain expertise (e.g., Dentist, Orthopedic, Dermatologist).
- **Responsive & Modern UI:** A beautifully crafted, non-generic interface using plain HTML, CSS, and Vanilla JavaScript (No heavy frontend frameworks).

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Other Tools:** CORS, Dotenv for environment variables.

## 📁 Directory Structure

```text
doctor-module/
├── backend/
│   ├── controllers/      # Route logic (doctorController.js)
│   ├── models/           # Mongoose schemas (Doctor.js)
│   ├── routes/           # API endpoints (doctorRoutes.js)
│   ├── .env              # Environment variables (PORT, MONGO_URI)
│   ├── seed.js           # Script to populate initial sample data
│   └── server.js         # Main backend application entry point
├── frontend/
│   ├── css/              # Global styles (style.css)
│   ├── js/               # Page-specific frontend logic (fetch API calls)
│   ├── index.html        # Dashboard view
│   ├── doctors.html      # All doctors list view
│   ├── add-doctor.html   # Form to add a new doctor
│   ├── edit-doctor.html  # Form to edit doctor details
│   └── search.html       # Search by specialization view
└── README.md
```

## ⚙️ Local Setup Instructions

Follow these steps to run the project locally on your machine.

### Prerequisites
1. **Node.js** installed on your machine.
2. **MongoDB** installed and running locally, OR an active **MongoDB Atlas** URI.

### 1. Setup the Backend
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd doctor-module/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional but Recommended)* Seed the database with sample data:
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The backend will now be running on `http://localhost:5000`*

### 2. Setup the Frontend
Because the frontend uses vanilla HTML/CSS/JS, no build step is required!
1. Navigate to the `frontend` folder.
2. Open `index.html` directly in your web browser.
   - *Alternatively: Right-click `index.html` in VS Code and select "Open with Live Server" for a better development experience.*

---

## 🔌 API Endpoints Reference

The backend exposes the following RESTful endpoints under `http://localhost:5000/api/doctors`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Fetch all doctors |
| `GET` | `/:id` | Fetch a single doctor by ID |
| `GET` | `/specialization/:spec` | Fetch doctors filtered by specialization |
| `POST` | `/` | Add a new doctor |
| `PUT` | `/:id` | Update an existing doctor's details |
| `DELETE` | `/:id` | Delete a doctor |
