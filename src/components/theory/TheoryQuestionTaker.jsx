import { useState, useContext,useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Brain, ChevronLeft, Send, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import UserContext from '../../context/UserContext';

export function TheoryQuestionTaker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch question data
    api.get(`/api/theory/${id}`)
      .then(response => {
        setQuestion(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching question:', error);
        toast.error('Failed to load question');
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      toast.error('Please enter your answer');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post('/api/theory/evaluate', {
        userId: user._id,
        questionId: question._id,
        userAnswer: userAnswer.trim()
      });
      
      setEvaluation(response.data);
      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setUserAnswer('');
    setEvaluation(null);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Please enter a username to answer questions</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-2">Theory Question</h1>
          <p className="text-gray-600">Take your time to think and answer thoroughly</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{question?.question}</h2>
            
            {!evaluation ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    id="answer"
                    className="form-input min-h-[200px]"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Your Answer:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{userAnswer}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 text-primary-600 mr-2" />
                    <h3 className="text-lg font-medium">AI Evaluation</h3>
                  </div>
                  
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary-800 font-medium">Score:</span>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary-700">{evaluation.score}</span>
                        <span className="text-primary-600 ml-1">/5</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-primary-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(evaluation.score / 5) * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-primary-800">
                      <h4 className="font-medium mb-2">Feedback:</h4>
                      <p className="text-primary-700">{evaluation.feedback}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Sample Answer:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{evaluation.sampleAnswer}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleRetry}
                  className="btn btn-secondary flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}