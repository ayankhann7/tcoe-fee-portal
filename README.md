# 🎓 TCOE Fee Management Portal

A premium, enterprise-grade full-stack web application designed for Theem College of Engineering to manage student fee collections, generate official receipts, and track financial analytics.

### 🚀 Live Demo
**URL:** [https://tcoe-fee-portal.vercel.app](https://tcoe-fee-portal.vercel.app)
> **Note:** The application database automatically seeds with demo data. You can log in immediately to test the features!
> 
> **Test Admin Credentials:**
> - **Username:** `admin`
> - **Password:** `admin123`

## ✨ Features

- **Premium UI/UX:** Built with a stunning Glassmorphism design system, smooth micro-animations, and a responsive layout.
- **Financial Analytics Dashboard:** Live, interactive charts (powered by Recharts) showing revenue distribution across academic years and collected vs. pending statistics.
- **Real-Time Email Verification & Reminders:** Integrated with Nodemailer to send real cryptographic verification links upon admin signup, and automated HTML email reminders to students with pending dues.
- **Bulk Data Management:** Blazing fast CSV Import/Export functionality (via Papaparse) capable of handling hundreds of student records instantly.
- **Automated PDF Generation:** 1-click generation of Official Itemized Fee Receipts and Automated Defaulter List Reports (via jsPDF).
- **Dynamic Fee Structures:** Itemized tracking for Tuition, Library, and Exam fees.

---

## 📸 Screenshots

![Screenshot](screenshot/Screenshot%20(415).png)
![Screenshot](screenshot/Screenshot%20(416).png)
![Screenshot](screenshot/Screenshot%20(417).png)
![Screenshot](screenshot/Screenshot%20(418).png)
![Screenshot](screenshot/Screenshot%20(419).png)
![Screenshot](screenshot/Screenshot%20(420).png)
![Screenshot](screenshot/Screenshot%20(421).png)
![Screenshot](screenshot/Screenshot%20(422).png)
![Screenshot](screenshot/Screenshot%20(423).png)
![Screenshot](screenshot/Screenshot%20(424).png)
![Screenshot](screenshot/Screenshot%20(425).png)

---

## 🚀 Tech Stack

### Frontend
- **React.js (Vite)**
- **CSS3** (Custom Glassmorphism Design System)
- **Recharts** (Data Visualization)
- **jsPDF & jsPDF-AutoTable** (Document Generation)
- **PapaParse** (CSV Processing)

### Backend
- **Node.js & Express.js** (REST API)
- **SQLite3** (Relational Database)
- **Nodemailer** (Email Service Integration)
- **JSON Web Tokens (JWT) & Bcrypt** (Authentication & Security)

---

## 💻 How to Run Locally

If you want to run this application on your local machine, follow these steps:

### 1. Start the Backend Server
```bash
cd backend
npm install
node server.js
```

### 2. Start the Frontend Server
Open a **new, separate terminal** and run:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to view the application!

---
*Built by Ayan Khan*
