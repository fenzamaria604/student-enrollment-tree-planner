import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import axios from 'axios';
import './App.css';

const API = 'https://student-enrollment-tree-planner-1.onrender.com/api';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [profileData, setProfileData] = useState({});
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/profile`, { headers: { Authorization: token } });
      setUser(res.data.student);
=======
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
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
<<<<<<< HEAD
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/login`, { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.student);
      } else {
        const res = await axios.post(`${API}/register`, { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.student);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/profile`, profileData, { headers: { Authorization: token } });
      setUser(res.data.student);
      setIsEditing(false);
      setMessage('✅ Profile updated! Your tree is growing!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating profile');
    }
  };

  const deleteProfile = async () => {
    try {
      await axios.delete(`${API}/profile`, { headers: { Authorization: token } });
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setMessage('Account deleted successfully');
    } catch (err) {
      setMessage('Error deleting account');
=======

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
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
<<<<<<< HEAD
    setUser(null);
  };

  const getTreeStage = (completion) => {
    if (completion < 25) return { emoji: "🌱", name: "Seed", message: "Complete your profile to help me grow!" };
    if (completion < 50) return { emoji: "🌿", name: "Sapling", message: "Almost there! Add more details." };
    if (completion < 75) return { emoji: "🌳", name: "Growing Tree", message: "Looking good! Keep going." };
    return { emoji: "🎄", name: "Fully Grown!", message: "Thank you for completing your profile!" };
  };

=======
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
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
  if (!token) {
    return (
      <div className="container">
        <div className="card">
<<<<<<< HEAD
          <h1> Student Enrollment</h1>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
=======
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
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <p>
<<<<<<< HEAD
            {isLogin ? "No account? " : "Have an account? "}
=======
            {isLogin ? "Don't have an account? " : "Already have an account? "}
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
            <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const treeStage = getTreeStage(user?.profileComplete || 0);

  return (
    <div className="container">
      <div className="header">
        
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="tree-container">
        <div className="tree-emoji">{treeStage.emoji}</div>
        <h2>{treeStage.name}</h2>
        <p>{treeStage.message}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${user?.profileComplete || 0}%` }}></div>
        </div>
        <p>{user?.profileComplete || 0}% Complete</p>
        
        {user?.profileComplete === 100 && (
          <div className="celebration">
            PROFILE DONE! 
            <br />
            Your tree is fully grown!
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="profile-card">
          <div className="flex-between">
            <h3>Your Profile</h3>
            <button className="edit-btn" onClick={() => { setIsEditing(true); setProfileData(user); }}>✏️ Edit Profile</button>
          </div>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.name || 'Not set'}</p>
          <p><strong>Branch:</strong> {user?.branch || 'Not set'}</p>
          <p><strong>Year:</strong> {user?.year || 'Not set'}</p>
          <p><strong>Age:</strong> {user?.age || 'Not set'}</p>
          <p><strong>Gender:</strong> {user?.gender || 'Not set'}</p>
          <p><strong>Height:</strong> {user?.height || 'Not set'} cm</p>
          <p><strong>Weight:</strong> {user?.weight || 'Not set'} kg</p>
          
          <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            🗑️ Delete My Account
          </button>
        </div>
      ) : (
        <div className="profile-card">
          <h3> Complete Your Profile</h3>
          <p className="info-text">Fill all details to grow your tree! </p>
          <form onSubmit={updateProfile}>
            <input type="text" placeholder="Full Name" value={profileData.name || ''} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            <input type="text" placeholder="Branch (CSE/IT/ECE/ME)" value={profileData.branch || ''} onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })} />
            <input type="number" placeholder="Year (1-4)" value={profileData.year || ''} onChange={(e) => setProfileData({ ...profileData, year: e.target.value })} />
            <input type="number" placeholder="Age" value={profileData.age || ''} onChange={(e) => setProfileData({ ...profileData, age: e.target.value })} />
            <select value={profileData.gender || ''} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input type="number" placeholder="Height (cm)" value={profileData.height || ''} onChange={(e) => setProfileData({ ...profileData, height: e.target.value })} />
            <input type="number" placeholder="Weight (kg)" value={profileData.weight || ''} onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })} />
            <button type="submit"> Save Changes & Grow Tree</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </div>
      )}
      
      {message && <p className="message">{message}</p>}
      
      {user?.profileComplete === 100 && !isEditing && (
        <div className="update-message">
          Your profile is complete!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="confirm-delete-btn" onClick={deleteProfile}>Yes, Delete</button>
              <button className="cancel-delete-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
=======
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
>>>>>>> f7859f04762c55936115883b8d4be06eedf41722
    </div>
  );
}

export default App;