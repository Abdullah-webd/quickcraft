import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, BarChart3, Award, Repeat } from 'lucide-react';
import UserContext from '../../context/UserContext';
import api from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PerformanceView() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect if user not logged in
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Please enter a username to view performance</h2>
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
    // Fetch performance data
    api.get(`/api/performance/${user._id}`)
      .then(response => {
        setPerformance(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching performance:', error);
        toast.error('Failed to load performance data');
        setIsLoading(false);
      });
  }, [user._id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!performance || performance.totalQuizzesTaken === 0) {
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
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Performance Data</h2>
          <p className="text-gray-600 mb-6">You haven't taken any quizzes yet.</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = {
    labels: performance.allPerformances.map(p => p.quizTitle),
    datasets: [
      {
        label: 'Score (%)',
        data: performance.allPerformances.map(p => p.score),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}%`;
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Performance History</h1>
          <p className="text-gray-600">Your quiz performance over time</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex items-center">
              <Award className="w-10 h-10 text-primary-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Overall Average</h3>
                <p className="text-2xl font-bold text-primary-700">{performance.overallAverage}%</p>
              </div>
            </div>
            
            <div className="bg-secondary-50 border border-secondary-100 rounded-lg p-4 flex items-center">
              <Repeat className="w-10 h-10 text-secondary-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">Quizzes Taken</h3>
                <p className="text-2xl font-bold text-secondary-700">{performance.totalQuizzesTaken}</p>
              </div>
            </div>
            
            <div className="bg-accent-50 border border-accent-100 rounded-lg p-4 flex items-center">
              <BarChart3 className="w-10 h-10 text-accent-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-accent-900">Best Score</h3>
                <p className="text-2xl font-bold text-accent-700">
                  {Math.max(...performance.allPerformances.map(p => p.score))}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
            <div className="h-[300px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Detailed History</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performance.allPerformances.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {item.quizTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.score >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : item.score >= 60 
                            ? 'bg-blue-100 text-blue-800'
                            : item.score >= 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceView;