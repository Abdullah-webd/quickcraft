import { Trophy, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function QuizResults({ quiz, correctAnswers, totalQuestions, onReturnHome }) {
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getScoreMessage = () => {
    if (score >= 90) return "Excellent!";
    if (score >= 70) return "Good job!";
    if (score >= 50) return "Not bad!";
    return "Keep practicing!";
  };

  const getScoreColor = () => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-primary-600";
    if (score >= 50) return "text-accent-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-600 p-6 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-1">Quiz Completed!</h1>
          <p>{quiz.title}</p>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-8">
            <p className="text-lg font-medium mb-2">{getScoreMessage()}</p>
            <div className="flex items-center justify-center space-x-2">
              <motion.span 
                className={`text-4xl font-bold ${getScoreColor()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {score}%
              </motion.span>
              <span className="text-gray-500">({correctAnswers}/{totalQuestions} correct)</span>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div 
                className={`h-4 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-accent-500' : 'bg-red-500'}`}
                initial={{ width: "0%" }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onReturnHome}
              className="btn btn-ghost border border-gray-300 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </button>
            <Link to="/performance" className="btn btn-primary flex items-center justify-center">
              View All Performance
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResults;