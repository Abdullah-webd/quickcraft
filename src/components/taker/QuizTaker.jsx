import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Heart, Check, X, BrainCircuit } from 'lucide-react';
import api from '../../services/api';
import UserContext from '../../context/UserContext';
import QuizResults from './QuizResults';

function QuizTaker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if user not logged in
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Please enter a username to take quizzes</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  useEffect(() => {
    // Fetch quiz data
    api.get(`/api/quizzes/${id}`)
      .then(response => {
        setQuiz(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        setIsLoading(false);
      });
  }, [id]);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return; // Prevent selecting after answer is chosen
    
    setSelectedAnswer(answerIndex);
    const currentCorrectIndex = quiz.questions[currentQuestion].correctAnswerIndex;
    const correct = answerIndex === currentCorrectIndex;
    
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }
    
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowNextButton(false);
      setAiExplanation(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    // Save performance data
    try {
      await api.post('/api/performance', {
        userId: user._id,
        quizId: quiz._id,
        score: score,
        quizTitle: quiz.title
      });
    } catch (error) {
      console.error('Error saving performance:', error);
    }
    
    setFinished(true);
  };

  const getAIExplanation = async () => {
    if (selectedAnswer === null) return;
    
    setIsLoadingAI(true);
    try {
      const currentQ = quiz.questions[currentQuestion];
      const response = await api.post('/api/gemini/explain', {
        question: currentQ.question,
        options: currentQ.answer,
        correctAnswer: currentQ.answer[currentQ.correctAnswerIndex],
        selectedAnswer: currentQ.answer[selectedAnswer]
      });
      
      setAiExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      toast.error('Failed to get AI explanation');
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Quiz not found</h2>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <QuizResults
        quiz={quiz}
        correctAnswers={correctAnswers}
        totalQuestions={quiz.questions.length}
        onReturnHome={() => navigate('/')}
      />
    );
  }

  const question = quiz.questions[currentQuestion];

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
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">{quiz.description}</p>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-primary-600 h-1 transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
          
          <div className="space-y-3 mb-6">
            {question.answer.map((option, index) => (
              <button
                key={index}
                className={`quiz-option w-full text-left flex justify-between items-center ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'correct-answer'
                      : 'wrong-answer'
                    : selectedAnswer !== null && index === question.correctAnswerIndex
                    ? 'correct-answer'
                    : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <span>{option}</span>
                {selectedAnswer === index && (
                  isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />
                )}
                {selectedAnswer !== null && selectedAnswer !== index && index === question.correctAnswerIndex && (
                  <Check className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
          
          {selectedAnswer !== null && (
            <div className="mb-4 animate-fade-in">
              <div 
                className={`flex items-center border-l-4 px-4 py-3 rounded-r mb-4 ${isCorrect 
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-500 bg-red-50 text-red-800"}
                `}
              >
                <div className="mr-3">
                  {isCorrect ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </p>
                  <p className="text-sm">
                    {isCorrect 
                      ? "Great job! That's the right answer."
                      : `The correct answer is: ${question.answer[question.correctAnswerIndex]}`
                    }
                  </p>
                </div>
              </div>
              
              {!aiExplanation && !isLoadingAI ? (
                <button 
                  onClick={getAIExplanation}
                  className="btn btn-ghost border border-gray-300 flex items-center"
                >
                  <BrainCircuit className="w-5 h-5 mr-2" />
                  Ask AI for Explanation
                </button>
              ) : isLoadingAI ? (
                <div className="flex items-center text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                  Generating explanation...
                </div>
              ) : (
                <div className="border border-primary-200 rounded-lg bg-primary-50 p-4 animate-fade-in">
                  <h3 className="text-primary-700 font-medium mb-2 flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2" />
                    AI Explanation
                  </h3>
                  <p className="text-gray-700">{aiExplanation}</p>
                </div>
              )}
            </div>
          )}
          
          {showNextButton && (
            <div className="flex justify-end mt-6 animate-fade-in">
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary flex items-center"
              >
                {currentQuestion < quiz.questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Finish Quiz
                    <Heart className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizTaker;