const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'tcoe_super_secret_key';
const PORTAL_KEY = 'TCOE_ADMIN_2026';

// --- EMAIL CONFIGURATION (Real Gmail Account) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'projectdemo81@gmail.com',
        pass: process.env.EMAIL_PASS || 'pjojkwkigocjzfpm'
    }
});

app.use(cors());
app.use(express.json());

// ==========================================
// Database Setup (SQLite)
// ==========================================
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollment_no TEXT UNIQUE,
        name TEXT,
        branch TEXT,
        year TEXT,
        total_fee INTEGER,
        tuition_fee INTEGER DEFAULT 0,
        library_fee INTEGER DEFAULT 0,
        exam_fee INTEGER DEFAULT 0,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        amount_paid INTEGER,
        date_paid TEXT,
        receipt_no TEXT UNIQUE,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )`);
});

// ==========================================
// Middleware
// ==========================================
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized!' });
        req.user = decoded;
        next();
    });
};

// ==========================================
// Auth Routes
// ==========================================
// 1. Signup (Real Email Verification)
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password, portalKey } = req.body;

    if (portalKey !== PORTAL_KEY) {
        return res.status(401).json({ error: 'Invalid Admin Portal Key!' });
    }

    const hash = bcrypt.hashSync(password, 8);
    const verificationToken = require('crypto').randomBytes(20).toString('hex');

    db.run(`INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)`, [username, email, hash, verificationToken], function (err) {
        if (err) return res.status(400).json({ error: 'Username or Email already exists' });

        // Email verification bypassed
        res.json({ 
            message: `Account successfully created! You can now log in.`, 
            userId: this.lastID 
        });
    });
});

// 2. Real Email Verification via Token
app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Invalid token' });

    db.run(`UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?`, [token], function (err) {
        if (err) return res.status(500).json({ error: 'Verification failed' });
        if (this.changes === 0) return res.status(400).json({ error: 'Invalid or expired verification link.' });
        res.json({ message: 'Email verified successfully! You can now login.' });
    });
});

// 3. Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        // Email verification bypassed for demo
        // if (user.is_verified === 0) return res.status(401).json({ error: 'Please verify your email first!' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ message: 'Login successful', token, username: user.username });
    });
});

// ==========================================
// Student Routes
// ==========================================
app.post('/api/students', verifyToken, (req, res) => {
    const { enrollment_no, name, branch, year, tuition_fee, library_fee, exam_fee, email } = req.body;
    const total_fee = Number(tuition_fee) + Number(library_fee) + Number(exam_fee);
    db.run(`INSERT INTO students (enrollment_no, name, branch, year, total_fee, tuition_fee, library_fee, exam_fee, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [enrollment_no, name, branch, year, total_fee, tuition_fee, library_fee, exam_fee, email], function (err) {
            if (err) return res.status(400).json({ error: 'Enrollment number already exists' });
            res.json({ id: this.lastID, message: 'Student added successfully' });
        });
});

app.post('/api/students/bulk', verifyToken, (req, res) => {
    const students = req.body.students; // Expecting an array
    if (!students || !Array.isArray(students)) return res.status(400).json({ error: 'Invalid data format' });

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(`INSERT OR IGNORE INTO students (enrollment_no, name, branch, year, total_fee, tuition_fee, library_fee, exam_fee, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        students.forEach(s => {
            const tuition = Number(s.tuition_fee) || 0;
            const library = Number(s.library_fee) || 0;
            const exam = Number(s.exam_fee) || 0;
            const total = tuition + library + exam;
            stmt.run([s.enrollment_no, s.name, s.branch, s.year, total, tuition, library, exam, s.email]);
        });

        stmt.finalize();
        db.run("COMMIT", err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Bulk import successful' });
        });
    });
});

app.get('/api/students', verifyToken, (req, res) => {
    const query = `
        SELECT s.*, 
               COALESCE(SUM(f.amount_paid), 0) as total_paid,
               (s.total_fee - COALESCE(SUM(f.amount_paid), 0)) as pending_fee
        FROM students s
        LEFT JOIN fees f ON s.id = f.student_id
        GROUP BY s.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.delete('/api/students/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    db.serialize(() => {
        db.run(`DELETE FROM fees WHERE student_id = ?`, id);
        db.run(`DELETE FROM students WHERE id = ?`, id, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Student deleted successfully' });
        });
    });
});

// ==========================================
// Fee Routes
// ==========================================
app.post('/api/fees', verifyToken, (req, res) => {
    const { student_id, amount_paid } = req.body;
    const date_paid = new Date().toISOString();

    // Generate unique Receipt ID
    const receipt_no = 'TCOE-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Check if overpayment
    db.get(`SELECT total_fee, COALESCE((SELECT SUM(amount_paid) FROM fees WHERE student_id = ?), 0) as paid FROM students WHERE id = ?`, [student_id, student_id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Student not found' });

        if ((row.paid + parseInt(amount_paid)) > row.total_fee) {
            return res.status(400).json({ error: 'Payment exceeds total fee pending amount!' });
        }

        db.run(`INSERT INTO fees (student_id, amount_paid, date_paid, receipt_no) VALUES (?, ?, ?, ?)`,
            [student_id, amount_paid, date_paid, receipt_no], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Fee recorded successfully', receipt_no });
            });
    });
});

app.get('/api/dashboard', verifyToken, (req, res) => {
    db.get(`SELECT COUNT(*) as total_students FROM students`, [], (err, sRow) => {
        db.get(`SELECT SUM(amount_paid) as total_revenue FROM fees`, [], (err, rRow) => {
            db.get(`SELECT SUM(total_fee) as expected_revenue FROM students`, [], (err, eRow) => {
                const totalRev = rRow && rRow.total_revenue ? rRow.total_revenue : 0;
                const expectedRev = eRow && eRow.expected_revenue ? eRow.expected_revenue : 0;
                res.json({
                    total_students: sRow ? sRow.total_students : 0,
                    total_revenue: totalRev,
                    pending_revenue: expectedRev - totalRev
                });
            });
        });
    });
});

app.get('/api/fees/recent', verifyToken, (req, res) => {
    const query = `
        SELECT f.amount_paid, f.date_paid, s.name, s.enrollment_no 
        FROM fees f
        JOIN students s ON f.student_id = s.id
        ORDER BY f.date_paid DESC LIMIT 6
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/students/:id/timeline', verifyToken, (req, res) => {
    db.all(`SELECT amount_paid, date_paid, receipt_no FROM fees WHERE student_id = ? ORDER BY date_paid DESC`, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/students/:id/reminder', verifyToken, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT s.*, (s.total_fee - COALESCE((SELECT SUM(amount_paid) FROM fees WHERE student_id = s.id), 0)) as pending_fee FROM students s WHERE s.id = ?`, [id], (err, student) => {
        if (err || !student) return res.status(404).json({ error: 'Student not found' });

        if (!student.email) return res.status(400).json({ error: 'Student does not have an email address recorded!' });

        const mailOptions = {
            from: 'tcoe.admin@college.edu',
            to: student.email,
            subject: `URGENT: Fee Reminder - ${student.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #ef4444; text-align: center;">Fee Payment Reminder</h2>
                    <p>Dear <strong>${student.name}</strong>,</p>
                    <p>This is an automated reminder from the Theem College of Engineering Accounts Department.</p>
                    <p>You have a pending fee balance of <strong style="color: #ef4444; font-size: 1.2em;">₹${student.pending_fee.toLocaleString()}</strong> for the ${student.year} academic year.</p>
                    <p>Please clear your dues immediately to avoid any late fees or restrictions on your academic portal.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #888; text-align: center;">This is an automated message generated by the TCOE Fee Management System.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Nodemailer Error: ", error);
                return res.status(500).json({ error: 'Failed to send reminder email. Check Nodemailer config.' });
            }
            console.log("Reminder Email sent! Preview it here: " + nodemailer.getTestMessageUrl(info));
            res.json({ message: `Reminder email successfully sent to ${student.name}!` });
        });
    });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
