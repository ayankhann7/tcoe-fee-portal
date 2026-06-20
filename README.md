# Theem College of Engineering - Fee Management Portal

This is a premium, enterprise-grade Fee Management System built with React (Vite) and Node.js (Express + SQLite).

## How to Run the Application

Because this is a full-stack application, you need to run both the **Backend Server** (Database & APIs) and the **Frontend Server** (User Interface) at the same time.

### 1. Start the Backend Server
1. Open a terminal or command prompt.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Start the Node.js server:
   ```bash
   node server.js
   ```
*(You should see a message saying "Backend running on port 5000" and "Connected to SQLite database".)*

### 2. Start the Frontend Server
1. Open a **second, separate terminal** window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
*(It will give you a local URL, usually `http://localhost:5173/`. Click that link to open the portal in your browser!)*

## Features Included
- **Premium Glassmorphism UI**
- **Interactive Analytics Dashboard (Recharts)**
- **Real Email Verification & Reminders (Nodemailer)**
- **Bulk CSV Import & Export (Papaparse)**
- **Itemized Fee Structures**
- **Automated Defaulters PDF Generator (jsPDF)**
- **Automated Official Receipt Generation**
