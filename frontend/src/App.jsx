import React, { useState, useEffect } from 'react';
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const getTreeStage = (completion) => {
    if (completion < 25) return { emoji: "🌱", name: "Seed", message: "Complete your profile to help me grow!" };
    if (completion < 50) return { emoji: "🌿", name: "Sapling", message: "Almost there! Add more details." };
    if (completion < 75) return { emoji: "🌳", name: "Growing Tree", message: "Looking good! Keep going." };
    return { emoji: "🎄", name: "Fully Grown!", message: "Thank you for completing your profile!" };
  };

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1>Student Enrollment</h1>
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
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <p>
            {isLogin ? "No account? " : "Have an account? "}
            <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

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
            PROFILE DONE
            <br />
            Your tree is fully grown! 🌳
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
            Delete My Account
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
            <button type="submit">Save Changes & Grow Tree</button>
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
    </div>
  );
}

export default App;