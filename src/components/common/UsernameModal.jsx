import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import UserContext from '../../context/UserContext';
import { UserCircle } from 'lucide-react';

function UsernameModal() {
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { saveUser } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (saveUser(username)) {
      setIsOpen(false);
      setUsername('');
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary flex items-center"
      >
        <UserCircle className="w-5 h-5 mr-1" /> Enter Username
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">Enter Your Username</h3>
            <p className="text-gray-600 mb-4">
              Please provide a username to track your quiz performance.
              No password or sign-up is required.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsernameModal;