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
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.studentId = decoded.studentId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ========== TEST ROUTES (Put these FIRST) ==========
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running! API is at /api' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ========== API ROUTES ==========

// REGISTER - CREATE student
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, branch, year, password } = req.body;
    
    // Check if student exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create student
    const student = new Student({
      name,
      email,
      branch,
      year,
      password: hashedPassword
    });
    
    await student.save();
    
    // Create token
    const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET);
    
    res.status(201).json({ 
      token, 
      student: { id: student._id, name, email, branch, year }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN - READ student
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
    
    const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET);
    
    res.json({ 
      token, 
      student: { id: student._id, name: student.name, email: student.email, branch: student.branch, year: student.year }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all students - READ
app.get('/api/students', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single student
app.get('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE student
app.put('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const { name, branch, year } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, branch, year },
      { new: true }
    ).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE student
app.delete('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TREE CALCULATOR - based on student count
app.get('/api/tree-suggestion', authMiddleware, async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    // Formula: 2 trees per student
    const suggestedTrees = studentCount * 2;
    res.json({ 
      studentCount, 
      suggestedTrees,
      formula: "2 trees per student",
      message: `Plant ${suggestedTrees} trees for ${studentCount} students to make campus green!`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});