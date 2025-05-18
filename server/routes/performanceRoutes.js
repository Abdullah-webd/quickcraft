import express from 'express';
import Performance from '../models/Performance.js';

const router = express.Router();

// Create a new performance record
router.post('/', async (req, res) => {
  try {
    const { userId, quizId, score, quizTitle } = req.body;
    
    if (!userId || !quizId || score === undefined || !quizTitle) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newPerformance = new Performance({
      userId,
      quizId,
      score,
      quizTitle
    });
    
    const savedPerformance = await newPerformance.save();
    res.status(201).json(savedPerformance);
  } catch (error) {
    console.error('Error creating performance record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get performance by user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all performances for this user
    const performances = await Performance.find({ userId }).sort({ date: -1 });
    
    if (performances.length === 0) {
      return res.json({
        totalQuizzesTaken: 0,
        overallAverage: 0,
        recentPerformances: [],
        allPerformances: []
      });
    }
    
    // Calculate overall average
    const totalScore = performances.reduce((sum, perf) => sum + perf.score, 0);
    const overallAverage = Math.round(totalScore / performances.length);
    
    // Get recent performances (5 most recent)
    const recentPerformances = performances.slice(0, 5);
    
    res.json({
      totalQuizzesTaken: performances.length,
      overallAverage,
      recentPerformances,
      allPerformances: performances
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;