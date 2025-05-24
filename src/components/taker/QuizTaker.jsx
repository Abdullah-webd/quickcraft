import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Heart, Check, X, BrainCircuit, Clock } from 'lucide-react';
import api from '../../services/api';
import UserContext from '../../context/UserContext';
import QuizResults from './QuizResults';

function QuizTimer({ timeLeft, totalTime }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="flex items-center space-x-2">
      <Clock className="w-5 h-5 text-gray-600" />
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="24"
            cy="24"
          />
          <circle
            className="text-primary-600 transition-all duration-1000"
            strokeWidth="2"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * progress) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="24"
            cy="24"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-sm font-medium">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}

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
  const [timeLeft, setTimeLeft] = useState(null);
  const [showTimerWarning, setShowTimerWarning] = useState(false);

  const finishQuiz = useCallback(async () => {
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
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
  }, [quiz, correctAnswers, user._id]);

  useEffect(() => {
    if (timeLeft === 0) {
      toast.warning('Time is up!');
      finishQuiz();
    }
  }, [timeLeft, finishQuiz]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !finished) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            clearInterval(timer);
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  useEffect(() => {
    // Fetch quiz data
    api.get(`/api/quizzes/${id}`)
      .then(response => {
        setQuiz(response.data);
        if (response.data.timerMode) {
          setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
          setShowTimerWarning(true);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        setIsLoading(false);
      });
  }, [id]);

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

  if (showTimerWarning && quiz.timerMode) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Clock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Timed Quiz</h2>
          <p className="text-gray-600 mb-6">
            This quiz has a time limit of {quiz.timeLimit} minutes. 
            The quiz will automatically submit when time runs out.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowTimerWarning(false)}
              className="btn btn-primary"
            >
              Start Quiz
            </button>
          </div>
        </div>
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
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        {quiz.timerMode && timeLeft > 0 && (
          <QuizTimer timeLeft={timeLeft} totalTime={quiz.timeLimit * 60} />
        )}
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