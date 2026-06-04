require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.log('MongoDB Error:', err));

// ========== SCHEMAS ==========

// Student Schema
const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  branch: { type: String, default: '' },
  year: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  gender: { type: String, default: '' },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  role: { type: String, default: 'student' },
  profileComplete: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// ========== HELPER FUNCTIONS ==========

// Calculate profile completion percentage
const getProfileCompletion = (student) => {
  let count = 0;
  if (student.email) count++;
  if (student.name) count++;
  if (student.branch) count++;
  if (student.year > 0) count++;
  if (student.age > 0) count++;
  if (student.gender) count++;
  if (student.height > 0) count++;
  if (student.weight > 0) count++;
  return Math.floor((count / 8) * 100);
};

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ========== TEST ROUTES ==========
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running! API is at /api' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ========== API ROUTES ==========

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const student = new Student({
      email,
      password: hashedPassword
    });
    
    await student.save();
    
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret');
    
    res.status(201).json({ 
      token, 
      student: { 
        id: student._id, 
        email: student.email,
        profileComplete: 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const completion = getProfileCompletion(student);
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret');
    
    res.json({ 
      token, 
      student: { 
        id: student._id, 
        email: student.email,
        name: student.name,
        branch: student.branch,
        year: student.year,
        age: student.age,
        gender: student.gender,
        height: student.height,
        weight: student.weight,
        profileComplete: completion
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PROFILE
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('-password');
    const completion = getProfileCompletion(student);
    res.json({ 
      student: {
        ...student._doc,
        profileComplete: completion
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, branch, year, age, gender, height, weight } = req.body;
    
    const student = await Student.findById(req.userId);
    if (name !== undefined) student.name = name;
    if (branch !== undefined) student.branch = branch;
    if (year !== undefined) student.year = year;
    if (age !== undefined) student.age = age;
    if (gender !== undefined) student.gender = gender;
    if (height !== undefined) student.height = height;
    if (weight !== undefined) student.weight = weight;
    await student.save();
    
    const completion = getProfileCompletion(student);
    res.json({ 
      student: {
        id: student._id,
        email: student.email,
        name: student.name,
        branch: student.branch,
        year: student.year,
        age: student.age,
        gender: student.gender,
        height: student.height,
        weight: student.weight,
        profileComplete: completion
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PROFILE
app.delete('/api/profile', authMiddleware, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});