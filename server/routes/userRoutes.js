import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Create or find a user by username
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ username: username.trim() });
    
    if (user) {
      return res.json(user);
    }
    
    // Create new user
    user = new User({ username: username.trim() });
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating/finding user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;