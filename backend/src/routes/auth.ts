import express from 'express';
import User from '../models/User';
import Roadmap from '../models/Roadmap'; // your existing roadmap model
import bcrypt from 'bcrypt';

const router = express.Router();

// POST /api/register

// POST /api/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Guest mode: blank email
    if (!email?.trim()) {
      return res.json({
        userId: 'pseudo-user-123',
        message: 'Guest mode activated',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password (only if provided – though frontend requires it)
    const hashedPassword = password ? await bcrypt.hash(password.trim(), 12) : null;

    // Create new user
    const newUser = await User.create({
      email: trimmedEmail,
      password: hashedPassword,
    });

    const userId = newUser._id.toString();

    // Create initial empty roadmap
    await Roadmap.create({
      userId,
      title: 'My Learning Roadmap',
      steps: [],
      lastUpdated: new Date().toISOString(),
    });

    res.json({ userId, message: 'Registered successfully' });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;