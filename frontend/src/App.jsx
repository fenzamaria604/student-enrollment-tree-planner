import React, { useState, useEffect } from 'react';
import api from './api';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [students, setStudents] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    year: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  // Check if logged in
  useEffect(() => {
    if (token) {
      fetchStudents();
      fetchTreeSuggestion();
    }
  }, [token]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTreeSuggestion = async () => {
    try {
      const res = await api.get('/tree-suggestion');
      setTreeData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post('/login', {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setMessage('Login successful!');
      } else {
        // REGISTER
        const res = await api.post('/register', formData);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setMessage('Registration successful!');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setStudents([]);
    setTreeData(null);
    setMessage('Logged out');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
        fetchTreeSuggestion();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // If not logged in, show Login/Register form
  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1>🌳 Student Enrollment & Tree Planner</h1>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="branch"
                  placeholder="Branch (CSE/IT/ECE/ME/Civil)"
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year (1/2/3/4)"
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

  // Logged in view - Dashboard
  return (
    <div className="container">
      <div className="header">
        <h1>🌳 Student Enrollment & Tree Planner</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Tree Suggestion Card */}
      {treeData && (
        <div className="tree-card">
          <h2>🌿 Tree Plantation Suggestion</h2>
          <div className="tree-stats">
            <p>📊 Total Students Enrolled: <strong>{treeData.studentCount}</strong></p>
            <p>🌱 Trees to Plant: <strong>{treeData.suggestedTrees}</strong></p>
            <p>📐 Formula: {treeData.formula}</p>
          </div>
          <div className="tree-message">
            🎯 {treeData.message}
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="students-section">
        <h2>📋 Enrolled Students ({students.length})</h2>
        <div className="student-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.branch}</td>
                  <td>{student.year}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;