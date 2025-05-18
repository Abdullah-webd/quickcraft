import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

const router = express.Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('creator', 'username').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'username');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new quiz
router.post('/', async (req, res) => {
  try {
    const { title, description, questions, creator } = req.body;
    
    // Validate input
    if (!title || !description || !questions || !creator) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (!questions.length) {
      return res.status(400).json({ message: 'Quiz must have at least one question' });
    }
    
    // Create new quiz
    const newQuiz = new Quiz({
      title,
      description,
      questions,
      creator
    });
    
    const savedQuiz = await newQuiz.save();
    
    // Populate creator information
    const populatedQuiz = await Quiz.findById(savedQuiz._id).populate('creator', 'username');
    
    res.status(201).json(populatedQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a quiz
router.put('/:id', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Update fields
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.questions = questions || quiz.questions;
    
    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;