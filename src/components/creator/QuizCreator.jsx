import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';
import UserContext from '../../context/UserContext';

function QuizCreator() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questionsInput, setQuestionsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user not logged in
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Please enter a username to create quizzes</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const validateAndParseQuestions = (input) => {
    try {
      // First try to parse the input as JSON
      let questions;
      try {
        questions = JSON.parse(input);
      } catch {
        // If JSON parse fails, try evaluating as JavaScript
        // This allows for more flexible input format
        questions = eval(`(${input})`);
      }

      if (!Array.isArray(questions)) {
        throw new Error('Input must be an array');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.answer) || q.answer.length !== 4) {
          throw new Error(`Question ${index + 1} must have a question and exactly 4 answers`);
        }
      });

      // Add correctAnswerIndex (default to first answer)
      return questions.map(q => ({
        ...q,
        correctAnswerIndex: 0
      }));
    } catch (error) {
      throw new Error(`Invalid question format: ${error.message}`);
    }
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (!quizDescription.trim()) {
      toast.error('Quiz description is required');
      return false;
    }

    if (!questionsInput.trim()) {
      toast.error('Questions are required');
      return false;
    }

    try {
      validateAndParseQuestions(questionsInput);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuiz()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const questions = validateAndParseQuestions(questionsInput);
      
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions,
        creator: user._id
      };
      
      const response = await api.post('/api/quizzes', quizData);
      toast.success('Quiz created successfully!');
      navigate(`/quiz/${response.data._id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleFormat = `[
  {
    question: "What's the capital of France?",
    answer: ["Paris", "London", "Berlin", "Madrid"]
  },
  {
    question: "2 + 2?",
    answer: ["3", "4", "5", "22"]
  }
]`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="quizTitle" className="form-label">
              Quiz Title
            </label>
            <input
              id="quizTitle"
              type="text"
              className="form-input"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter a title for your quiz"
              required
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="quizDescription" className="form-label">
              Quiz Description
            </label>
            <textarea
              id="quizDescription"
              className="form-input min-h-[80px]"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              placeholder="Enter a description for your quiz"
              required
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="questions" className="form-label">
              Questions Array
            </label>
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                Paste your questions array in the following format:
              </p>
              <pre className="bg-gray-50 p-4 rounded-md text-sm mt-2 overflow-x-auto">
                {exampleFormat}
              </pre>
            </div>
            <textarea
              id="questions"
              className="form-input font-mono text-sm min-h-[200px]"
              value={questionsInput}
              onChange={(e) => setQuestionsInput(e.target.value)}
              placeholder="Paste your questions array here..."
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizCreator;