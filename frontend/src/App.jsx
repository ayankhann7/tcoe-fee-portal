import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import { LayoutDashboard, Users, CreditCard, LogOut, GraduationCap, DollarSign, Activity, FileText, UserPlus, Clock, Upload, Download, Mail } from 'lucide-react';
import { generateReceiptPDF } from './generateReceipt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- API CONFIGURATION ---
// In production (Vercel), it will use the VITE_API_URL environment variable.
// In development, it defaults to your local backend.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- AUTH CONTEXT & ROUTES ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('tcoe_token');
  return token ? children : <Navigate to="/login" />;
};

// --- AUTH PAGES ---
function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', portalKey: '' });
  const [message, setMessage] = useState('');
  
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/signup`, formData);
      setMessage(`Success! ${res.data.message}`);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>TCOE Portal Signup</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Create Admin Account</p>
        {message && <div style={{ marginBottom: '1rem', color: message.includes('Success') ? 'var(--success)' : 'var(--danger)', textAlign: 'center' }}>{message}</div>}
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Username</label>
            <input className="input" required onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input className="input" type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Admin Portal Key</label>
            <input className="input" type="password" required onChange={e => setFormData({...formData, portalKey: e.target.value})} />
          </div>
          <button className="btn" type="submit">Sign Up</button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" className="text-link">Login</Link>
        </p>
      </div>
    </div>
  );
}

function VerifyEmail() {
  const [message, setMessage] = useState('Checking verification link...');
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Invalid verification link. No token found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.post(`${API}/auth/verify`, { token });
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Verification failed');
      }
    };
    verify();
  }, [location.search]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Real Email Verification</p>
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
          <h3 style={{ color: message.includes('success') ? 'var(--success)' : (message.includes('Checking') ? 'var(--text-main)' : 'var(--danger)') }}>
            {message}
          </h3>
        </div>
        <p style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link to="/login" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to Login</Link>
        </p>
      </div>
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      localStorage.setItem('tcoe_token', res.data.token);
      localStorage.setItem('tcoe_user', res.data.username);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>TCOE Login</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Secure Admin Access</p>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit">Access Portal</button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          New Admin? <Link to="/signup" className="text-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

// --- LAYOUT ---
function Layout({ children, pageTitle, breadcrumb }) {
  const location = useLocation();
  const username = localStorage.getItem('tcoe_user');

  const handleLogout = () => {
    localStorage.removeItem('tcoe_token');
    localStorage.removeItem('tcoe_user');
    window.location.href = '/login';
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <GraduationCap size={28} />
          TCOE Portal
        </div>
        <nav className="nav-menu">
          <div className="nav-category">TCOE</div>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}><LayoutDashboard size={18} /> Dashboard</Link>
          
          <div className="nav-category" style={{ marginTop: '1.5rem' }}>STUDENTS</div>
          <Link to="/students" className={`nav-item ${location.pathname === '/students' ? 'active' : ''}`}><Users size={18} /> View Students</Link>
          <Link to="/students#add" className={`nav-item`}><UserPlus size={18} /> Add Student</Link>
          <Link to="/fees" className={`nav-item ${location.pathname === '/fees' ? 'active' : ''}`}><CreditCard size={18} /> Fees</Link>
          <Link to="/" className={`nav-item`}><FileText size={18} /> Reports</Link>
        </nav>
      </aside>
      
      <main className="main-wrapper">
        <div className="page-topbar">
          <div className="page-breadcrumb">{breadcrumb}</div>
          <div className="topbar-right">
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Welcome, {username}</span>
            <button className="btn-logout-small" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        {pageTitle && <h1 className="page-title">{pageTitle}</h1>}
        {children}
      </main>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard() {
  const [data, setData] = useState({ total_students: 0, total_revenue: 0, pending_revenue: 0 });
  const [recentFees, setRecentFees] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` };
        
        // Fetch Top Stats
        const resStats = await axios.get(`${API}/dashboard`, { headers });
        setData(resStats.data);
        
        // Fetch Recent Activity
        const resActivity = await axios.get(`${API}/fees/recent`, { headers });
        setRecentFees(resActivity.data);
        
        // Fetch Students for Charts
        const resStudents = await axios.get(`${API}/students`, { headers });
        const students = resStudents.data;
        
        // Compute Chart Data by Year
        const grouped = { FE: { paid: 0, pending: 0 }, SE: { paid: 0, pending: 0 }, TE: { paid: 0, pending: 0 }, BE: { paid: 0, pending: 0 } };
        students.forEach(s => {
          if (grouped[s.year]) {
            grouped[s.year].paid += s.total_paid;
            grouped[s.year].pending += s.pending_fee;
          }
        });
        setChartData([
          { name: 'FE', Paid: grouped.FE.paid, Pending: grouped.FE.pending },
          { name: 'SE', Paid: grouped.SE.paid, Pending: grouped.SE.pending },
          { name: 'TE', Paid: grouped.TE.paid, Pending: grouped.TE.pending },
          { name: 'BE', Paid: grouped.BE.paid, Pending: grouped.BE.pending }
        ]);
        
      } catch (err) { console.error('Failed to fetch dashboard data', err); }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Collected', value: data.total_revenue },
    { name: 'Pending', value: data.pending_revenue }
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <Layout breadcrumb="Dashboard / Overview" pageTitle="Admin Overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <p>Total Students</p>
            <h3>{data.total_students}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)', borderColor: 'rgba(14, 165, 233, 0.2)' }}><DollarSign size={24} /></div>
          <div className="stat-info">
            <p>Total Collected</p>
            <h3>₹{data.total_revenue?.toLocaleString() || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)' }}><Activity size={24} /></div>
          <div className="stat-info">
            <p>Total Pending</p>
            <h3>₹{data.pending_revenue?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="chart-container">
          <h3 className="chart-title">Revenue by Academic Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)'}} />
              <Bar dataKey="Paid" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Pending" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Overall Fee Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="activity-section">
        <h3 className="chart-title"><Clock size={18} style={{marginRight: '8px', marginBottom: '-3px'}}/> Recent Payment Activity</h3>
        <div className="activity-list">
          {recentFees.map((fee, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon"><DollarSign size={16} /></div>
              <div className="activity-details">
                <p><strong>{fee.name}</strong> ({fee.enrollment_no}) paid <strong style={{color: '#10b981'}}>₹{fee.amount_paid.toLocaleString()}</strong></p>
                <small>{new Date(fee.date_paid).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {recentFees.length === 0 && <p style={{color: '#94a3b8'}}>No recent activity.</p>}
        </div>
      </div>
    </Layout>
  );
}

// --- STUDENTS ---
function Students() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTimeline, setStudentTimeline] = useState([]);
  
  // Name split fields and Itemized Fees
  const [formData, setFormData] = useState({ 
    enrollment_no: '', surname: '', firstName: '', middleName: '', 
    branch: 'Computer Engineering', year: 'FE', tuition_fee: '', library_fee: '', exam_fee: '', email: '' 
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = () => {
    axios.get(`${API}/students`, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } })
      .then(res => setStudents(res.data));
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await axios.get(`${API}/students/${student.id}/timeline`, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
      setStudentTimeline(res.data);
    } catch (err) { console.error('Failed to load timeline', err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${formData.surname.trim()} ${formData.firstName.trim()} ${formData.middleName.trim()}`.trim();
      
      const payload = { ...formData, name: fullName };
      
      await axios.post(`${API}/students`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
      setFormData({ enrollment_no: '', surname: '', firstName: '', middleName: '', branch: 'Computer Engineering', year: 'FE', tuition_fee: '', library_fee: '', exam_fee: '', email: '' });
      fetchStudents();
      alert('Student added successfully!');
    } catch (err) { alert(err.response?.data?.error || 'Error adding student'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to completely remove this student?')) {
      await axios.delete(`${API}/students/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
      fetchStudents();
    }
  };

  const handleSendReminder = async (e, id) => {
    e.stopPropagation(); // Don't open drawer
    try {
      await axios.post(`${API}/students/${id}/reminder`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
      alert('Reminder email sent successfully!');
    } catch (err) { alert(err.response?.data?.error || 'Failed to send reminder'); }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const payload = { students: results.data };
          await axios.post(`${API}/students/bulk`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
          alert('Bulk import successful!');
          fetchStudents();
        } catch (err) { alert('Failed to import CSV.'); }
      }
    });
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(students.map(s => ({
      Enrollment: s.enrollment_no,
      Name: s.name,
      Email: s.email || 'N/A',
      Branch: s.branch,
      Year: s.year,
      Total_Fee: s.total_fee,
      Paid: s.total_paid,
      Pending: s.pending_fee
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "tcoe_students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDefaultersReport = () => {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(239, 68, 68); // Red
        doc.text('THEEM COLLEGE OF ENGINEERING', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Defaulters Report - Pending Fees', 105, 30, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });

        const defaulters = students.filter(s => s.pending_fee > 0);

        autoTable(doc, {
          startY: 50,
          head: [['Name', 'Enrollment No', 'Year', 'Branch', 'Pending Balance']],
          body: defaulters.map(s => [
            s.name,
            s.enrollment_no,
            s.year,
            s.branch,
            `Rs. ${s.pending_fee.toLocaleString()}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' }
        });

        doc.save('TCOE_Defaulters_Report.pdf');
      });
    });
  };

  return (
    <Layout breadcrumb="Dashboard / Students">
      
      <h1 className="page-title" id="add">Add New Student</h1>
      <div className="form-container">
        <form onSubmit={handleAdd}>
          <div className="form-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Surname</label>
              <input className="input" required value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} placeholder="e.g. Khan" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>First Name</label>
              <input className="input" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="e.g. Ayan" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Middle Name</label>
              <input className="input" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} placeholder="e.g. Ali" />
            </div>
          </div>
          
          <div className="form-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Enrollment Number / PRN</label>
              <input className="input" required value={formData.enrollment_no} onChange={e => setFormData({...formData, enrollment_no: e.target.value})} placeholder="e.g. 7884584561" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Email Address</label>
              <input type="email" className="input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@college.edu" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Branch</label>
              <select className="input" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}>
                <option>Computer Engineering</option>
                <option>Information Technology</option>
                <option>Electronics and Telecommunication</option>
              </select>
            </div>
            <div className="input-group">
              <label>Year</label>
              <select className="input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                <option>FE</option>
                <option>SE</option>
                <option>TE</option>
                <option>BE</option>
              </select>
            </div>
          </div>
          
          <div className="form-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Tuition Fee (₹)</label>
              <input type="number" className="input" required value={formData.tuition_fee} onChange={e => setFormData({...formData, tuition_fee: e.target.value})} placeholder="e.g. 60000" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Library Fee (₹)</label>
              <input type="number" className="input" required value={formData.library_fee} onChange={e => setFormData({...formData, library_fee: e.target.value})} placeholder="e.g. 5000" />
            </div>
            <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Exam Fee (₹)</label>
              <input type="number" className="input" required value={formData.exam_fee} onChange={e => setFormData({...formData, exam_fee: e.target.value})} placeholder="e.g. 10000" />
            </div>
          </div>
          
          <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Add Student</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ margin: 0 }}>View All Students</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleDefaultersReport} style={{ background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} /> Defaulters PDF
          </button>
          <label className="btn" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          </label>
          <button className="btn" onClick={handleExportCSV} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="controls-container" style={{ marginTop: '1.5rem' }}>
        <div className="search-bar">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by Name or Enrollment No..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>All</button>
          <button className={`tab-btn ${activeTab === 'FE' ? 'active' : ''}`} onClick={() => setActiveTab('FE')}>FE</button>
          <button className={`tab-btn ${activeTab === 'SE' ? 'active' : ''}`} onClick={() => setActiveTab('SE')}>SE</button>
          <button className={`tab-btn ${activeTab === 'TE' ? 'active' : ''}`} onClick={() => setActiveTab('TE')}>TE</button>
          <button className={`tab-btn ${activeTab === 'BE' ? 'active' : ''}`} onClick={() => setActiveTab('BE')}>BE</button>
        </div>
      </div>

      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Enrollment</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Total Fees</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter(s => activeTab === 'ALL' || s.year === activeTab)
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollment_no.includes(searchQuery))
              .map(s => (
              <tr key={s.id} onClick={() => handleViewStudent(s)} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.enrollment_no}</td>
                <td>{s.branch}</td>
                <td>{s.year}</td>
                <td>₹{s.total_fee.toLocaleString()}</td>
                <td>₹{s.total_paid.toLocaleString()}</td>
                <td>₹{s.pending_fee.toLocaleString()}</td>
                <td>
                  <span className={`badge ${s.pending_fee <= 0 ? 'success' : (s.total_fee === s.pending_fee ? 'danger' : 'warning')}`}>
                    {s.pending_fee <= 0 ? 'CLEARED' : (s.total_fee === s.pending_fee ? 'UNPAID' : 'PARTIAL')}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  {s.pending_fee > 0 && (
                    <button className="btn" style={{ background: '#3b82f6', padding: '0.4rem', borderRadius: '6px' }} onClick={(e) => handleSendReminder(e, s.id)} title="Send Email Reminder">
                      <Mail size={14} color="#fff" />
                    </button>
                  )}
                  <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>Delete</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan="9" style={{textAlign:'center', padding: '2rem'}}>No students registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Slide-Out Drawer */}
      {selectedStudent && (
        <div className="drawer-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="student-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Student Profile</h2>
              <button className="btn-close" onClick={() => setSelectedStudent(null)}>×</button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div className="profile-avatar">{selectedStudent.name.charAt(0)}</div>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>{selectedStudent.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>PRN: {selectedStudent.enrollment_no}</p>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Paid</p>
                <h3 style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>₹{selectedStudent.total_paid.toLocaleString()}</h3>
              </div>
              <div style={{ flex: 1, padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Pending Balance</p>
                <h3 style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>₹{selectedStudent.pending_fee.toLocaleString()}</h3>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Payment Timeline</h3>
              {studentTimeline.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No payments recorded yet.</p>
              ) : (
                <div className="timeline">
                  {studentTimeline.map((payment, i) => (
                    <div key={i} className="timeline-item">
                      <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Paid ₹{payment.amount_paid.toLocaleString()}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Receipt: {payment.receipt_no}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{new Date(payment.date_paid).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
      
    </Layout>
  );
}

// --- FEES (INTERACTIVE TABLE UX) ---
function Fees() {
  const [students, setStudents] = useState([]);
  const [payAmounts, setPayAmounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = () => {
    axios.get(`${API}/students`, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } })
      .then(res => setStudents(res.data));
  };

  const handleUpdate = async (studentId) => {
    const amount = payAmounts[studentId];
    if (!amount || amount <= 0) return alert('Enter a valid amount to pay.');
    
    try {
      const res = await axios.post(`${API}/fees`, { student_id: studentId, amount_paid: amount }, { headers: { Authorization: `Bearer ${localStorage.getItem('tcoe_token')}` } });
      
      // Automatically Generate PDF Receipt
      const student = students.find(s => s.id === studentId);
      if(student) generateReceiptPDF(student, amount, res.data.receipt_no);
      
      alert(`Payment Successful! Receipt downloaded.`);
      setPayAmounts({...payAmounts, [studentId]: ''});
      fetchStudents(); // Refresh table
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <Layout breadcrumb="Dashboard / Fees" pageTitle="Fee Management">
      
      <div className="controls-container">
        <div className="search-bar">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by Name or Enrollment No..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>All</button>
          <button className={`tab-btn ${activeTab === 'FE' ? 'active' : ''}`} onClick={() => setActiveTab('FE')}>FE</button>
          <button className={`tab-btn ${activeTab === 'SE' ? 'active' : ''}`} onClick={() => setActiveTab('SE')}>SE</button>
          <button className={`tab-btn ${activeTab === 'TE' ? 'active' : ''}`} onClick={() => setActiveTab('TE')}>TE</button>
          <button className={`tab-btn ${activeTab === 'BE' ? 'active' : ''}`} onClick={() => setActiveTab('BE')}>BE</button>
        </div>
      </div>

      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Total Fees</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Pay Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter(s => activeTab === 'ALL' || s.year === activeTab)
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollment_no.includes(searchQuery))
              .map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.branch}</td>
                <td>{s.year}</td>
                <td>₹{s.total_fee.toLocaleString()}</td>
                <td>₹{s.total_paid.toLocaleString()}</td>
                <td style={{ color: s.pending_fee > 0 ? 'var(--danger)' : 'inherit' }}>
                  ₹{s.pending_fee.toLocaleString()}
                </td>
                <td>
                  <input 
                    type="number" 
                    className="inline-input" 
                    placeholder="Enter amount"
                    value={payAmounts[s.id] || ''}
                    onChange={(e) => setPayAmounts({...payAmounts, [s.id]: e.target.value})}
                    disabled={s.pending_fee <= 0}
                  />
                </td>
                <td>
                  <button 
                    className="btn-update" 
                    onClick={() => handleUpdate(s.id)}
                    disabled={s.pending_fee <= 0}
                    style={{ opacity: s.pending_fee <= 0 ? 0.5 : 1 }}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding: '2rem'}}>No students available. Please add students first.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

// --- APP ENTRY ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/fees" element={<PrivateRoute><Fees /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
