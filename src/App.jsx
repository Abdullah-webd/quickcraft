import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/Dashboard';
import QuizCreator from './components/creator/QuizCreator';
import QuizTaker from './components/taker/QuizTaker';
import PerformanceView from './components/performance/PerformanceView';
import UserContext from './context/UserContext';
import api from './services/api';
import { TheoryQuestionTaker } from './components/theory/TheoryQuestionTaker';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('quizAppUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check server connection
    api.get('/api/health')
      .then(() => {
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Server connection error:', error);
        toast.error('Cannot connect to server. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const saveUser = (username) => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return false;
    }
    
    // Create or retrieve user
    api.post('/api/users', { username })
      .then(response => {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('quizAppUser', JSON.stringify(userData));
        toast.success(`Welcome, ${userData.username}!`);
      })
      .catch(error => {
        console.error('Error saving user:', error);
        toast.error('Failed to save username. Please try again.');
      });
      
    return true;
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('quizAppUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, saveUser, clearUser }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<QuizCreator />} />
            <Route path="/theory/:id" element={<TheoryQuestionTaker />} />
            <Route path="/quiz/:id" element={<QuizTaker />} />
            <Route path="/performance" element={<PerformanceView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserContext.Provider>
  );
}

export default App;