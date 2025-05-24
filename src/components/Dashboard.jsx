import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Brain, BarChart3, ChevronRight, Clock } from 'lucide-react';
import api from '../services/api';
import UserContext from '../context/UserContext';
import UsernameModal from './common/UsernameModal';

function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [userPerformance, setUserPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch quizzes
    api.get('/api/quizzes')
      .then(response => {
        setQuizzes(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
        setIsLoading(false);
      });

    // Fetch user performance if user is logged in
    if (user) {
      api.get(`/api/performance/${user._id}`)
        .then(response => {
          setUserPerformance(response.data);
        })
        .catch(error => {
          console.error('Error fetching performance:', error);
        });
    }
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!user ? (
        <div className="text-center py-12 px-4 animate-fade-in">
          <Brain className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to QuizCraft</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create and take quizzes, track your performance, and get AI-powered explanations for each question.
          </p>
          <UsernameModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Available Quizzes</h2>
              <Link to="/create" className="btn btn-primary">
                Create Quiz
              </Link>
            </div>

            {quizzes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center border border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No quizzes available yet.</p>
                <Link to="/create" className="btn btn-primary">
                  Create Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map(quiz => (
                  <div key={quiz._id} className="card group hover:border-primary-300" onClick={() => navigate(`/quiz/${quiz._id}`)}>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-1" />
                          <span>{quiz.questions.length} Questions</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {quiz.timerMode ? `${quiz.timeLimit} mins` : 'No time limit'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Created by: {quiz.creator.username}
                      </span>
                      <ChevronRight className="h-5 w-5 text-primary-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary-600 mr-2" />
                <h3 className="text-xl font-semibold">Your Performance</h3>
              </div>
              
              {userPerformance ? (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Overall Average</span>
                      <span className="text-sm font-semibold">{userPerformance.overallAverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${userPerformance.overallAverage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Quizzes Completed</span>
                      <span className="text-sm font-semibold">{userPerformance.totalQuizzesTaken}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Performances</h4>
                    {userPerformance.recentPerformances.length > 0 ? (
                      <div className="space-y-2">
                        {userPerformance.recentPerformances.map(perf => (
                          <div key={perf._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm truncate flex-1">{perf.quizTitle}</span>
                            <span className="text-sm font-medium ml-2">{perf.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No quizzes taken yet</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link to="/performance" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center">
                      View Full Performance
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">Take a quiz to see your performance stats</p>
                  {quizzes.length > 0 && (
                    <Link to={`/quiz/${quizzes[0]._id}`} className="btn btn-secondary">
                      Take a Quiz
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;