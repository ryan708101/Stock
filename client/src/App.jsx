import { useState, useEffect } from 'react';
import AuthenticationForm from './components/Login';
import StockDashboard from './components/Dashboard';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Retrieve user data from localStorage
    const savedUserData = localStorage.getItem('stockDashboardUser');
    if (savedUserData) {
      try {
        setCurrentUser(JSON.parse(savedUserData));
      } catch (parseError) {
        console.error('Error parsing stored user:', parseError);
        localStorage.removeItem('stockDashboardUser');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleUserLogin = (authenticatedUserData) => {
    setCurrentUser(authenticatedUserData);
    localStorage.setItem('stockDashboardUser', JSON.stringify(authenticatedUserData));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('stockDashboardUser');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-xl text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {currentUser ? (
        <StockDashboard user={currentUser} onLogout={handleUserLogout} onUserUpdate={setCurrentUser} />
      ) : (
        <AuthenticationForm onUserAuthenticated={handleUserLogin} />
      )}
    </div>
  );
}

export default App;

