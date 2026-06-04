require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

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

// Get tree stage based on completion
const getTreeStage = (completion) => {
  if (completion < 25) return { emoji: "🌱", name: "Seed", message: "Complete your profile to help me grow!" };
  if (completion < 50) return { emoji: "🌿", name: "Sapling", message: "Almost there! Add more details." };
  if (completion < 100) return { emoji: "🌳", name: "Growing Tree", message: "Looking good! Keep going." };
  return { emoji: "🎄", name: "Fully Grown!", message: "Thank you for completing your profile!" };
};

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email exists' });
    
    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ email, password: hashed, role: role || 'student' });
    await student.save();
    
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, student: { id: student._id, email: student.email, role: student.role, profileComplete: 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    
    const completion = getProfileCompletion(student);
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'secret');
    res.json({ 
      token, 
      student: { 
        id: student._id, 
        email: student.email, 
        role: student.role,
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

// Update profile
app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { name, branch, year, age, gender, height, weight } = req.body;
    
    const student = await Student.findById(decoded.id);
    if (name) student.name = name;
    if (branch) student.branch = branch;
    if (year) student.year = year;
    if (age) student.age = age;
    if (gender) student.gender = gender;
    if (height) student.height = height;
    if (weight) student.weight = weight;
    await student.save();
    
    const completion = getProfileCompletion(student);
    res.json({ 
      student: {
        id: student._id,
        email: student.email,
        role: student.role,
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

// DELETE profile - Delete user account
app.delete('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    await Student.findByIdAndDelete(decoded.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.listen(5000, () => console.log('Server running on port 5000'));