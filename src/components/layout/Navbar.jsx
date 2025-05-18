import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Plus, BarChart3, Home, LogOut } from 'lucide-react';
import UserContext from '../../context/UserContext';
import UsernameModal from '../common/UsernameModal';

function Navbar() {
  const { user, clearUser } = useContext(UserContext);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary-600" />
            <span className="font-bold text-xl text-gray-800">QuizCraft</span>
          </Link>
          
          <nav className="flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  <div className="flex items-center space-x-1">
                    <Home className="w-4 h-4" />
                    <span className="hidden md:inline">Home</span>
                  </div>
                </Link>
                <Link to="/create" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/create')}`}>
                  <div className="flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Create Quiz</span>
                  </div>
                </Link>
                <Link to="/performance" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/performance')}`}>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden md:inline">Performance</span>
                  </div>
                </Link>
                <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                  <span className="mr-2 text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <button 
                    onClick={clearUser}
                    className="p-1 rounded-full hover:bg-gray-100"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </>
            ) : (
              <UsernameModal />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;