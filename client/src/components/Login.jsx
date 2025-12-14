import { useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';

const API_ENDPOINT_BASE = 'http://localhost:5000/api';

const AuthenticationForm = ({ onUserAuthenticated }) => {
  const [registrationMode, setRegistrationMode] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const processFormSubmission = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    // Input validation
    if (!userEmail.trim()) {
      setErrorMessage('Please enter your email');
      setIsProcessing(false);
      return;
    }
    if (!userPassword) {
      setErrorMessage('Please enter your password');
      setIsProcessing(false);
      return;
    }
    if (registrationMode && !userFullName.trim()) {
      setErrorMessage('Please enter your full name');
      setIsProcessing(false);
      return;
    }
    if (userPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setIsProcessing(false);
      return;
    }

    try {
      const apiRoute = registrationMode ? '/register' : '/login';
      const requestBody = registrationMode
        ? {
            email: userEmail.trim(),
            password: userPassword,
            fullName: userFullName.trim()
          }
        : {
            email: userEmail.trim(),
            password: userPassword
          };

      const apiResponse = await axios.post(`${API_ENDPOINT_BASE}${apiRoute}`, requestBody);

      if (apiResponse.data.success) {
        onUserAuthenticated(apiResponse.data.user);
      }
    } catch (apiError) {
      setErrorMessage(apiError.response?.data?.error || `${registrationMode ? 'Registration' : 'Login'} failed. Please try again.`);
      console.error(`${registrationMode ? 'Registration' : 'Login'} error:`, apiError);
    } finally {
      setIsProcessing(false);
    }
  };

  const switchAuthMode = () => {
    setRegistrationMode(!registrationMode);
    setErrorMessage('');
    setUserEmail('');
    setUserPassword('');
    setUserFullName('');
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-indigo-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.3),transparent_50%)]"></div>
        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl mb-6">
              <TrendingUp size={40} className="text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
              TradePulse
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              Real-time market insights at your fingertips
            </p>
          </div>
          <div className="mt-12 space-y-4 text-left max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-violet-400 mt-2"></div>
              <div>
                <h3 className="text-white font-semibold mb-1">Live Price Updates</h3>
                <p className="text-slate-400 text-sm">Get real-time stock prices updated every second</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-violet-400 mt-2"></div>
              <div>
                <h3 className="text-white font-semibold mb-1">Smart Subscriptions</h3>
                <p className="text-slate-400 text-sm">Track your favorite stocks with ease</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-violet-400 mt-2"></div>
              <div>
                <h3 className="text-white font-semibold mb-1">Visual Analytics</h3>
                <p className="text-slate-400 text-sm">Beautiful charts and data visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 p-2.5 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">TradePulse</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {registrationMode ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400">
              {registrationMode ? 'Start tracking stocks today' : 'Sign in to continue'}
            </p>
          </div>

        <form onSubmit={processFormSubmission} className="space-y-7">
          {registrationMode && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-3">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={userFullName}
                onChange={(event) => setUserFullName(event.target.value)}
                placeholder="John Doe"
                className="w-full px-5 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500/50 outline-none transition-all duration-200"
                disabled={isProcessing}
                autoFocus={registrationMode}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-3">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-5 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500/50 outline-none transition-all duration-200"
              disabled={isProcessing}
              autoFocus={!registrationMode}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-3">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={userPassword}
              onChange={(event) => setUserPassword(event.target.value)}
              placeholder={registrationMode ? "At least 6 characters" : "Enter your password"}
              className="w-full px-5 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500/50 outline-none transition-all duration-200"
              disabled={isProcessing}
            />
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3.5 rounded-xl backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/20"
          >
            {isProcessing
              ? registrationMode
                ? 'Creating account...'
                : 'Logging in...'
              : registrationMode
                ? 'Register'
                : 'Login'}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchAuthMode}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors duration-200"
              disabled={isProcessing}
            >
              {registrationMode
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default AuthenticationForm;

