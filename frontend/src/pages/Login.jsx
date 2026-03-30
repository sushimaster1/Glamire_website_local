import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      await setUser(response.data, response.data.token);
      response.data.role === 'seller' ? navigate('/seller') : navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/google', {
        credential: credentialResponse.credential,
      });
      await setUser(response.data, response.data.token);
      response.data.role === 'seller' ? navigate('/seller') : navigate('/');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-premium-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-premium-100 animate-slide-up">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-premium-900 mb-2">Welcome Back</h2>
          <p className="text-premium-400">Sign in to access your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
            shape="rectangular"
            size="large"
            width="368"
            text="signin_with"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-premium-100" />
          <span className="text-xs text-premium-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-premium-100" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-premium-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-premium-50 border border-premium-200 rounded-md focus:outline-none focus:ring-1 focus:ring-premium-500 transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-premium-700" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-premium-500 hover:text-premium-800 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-premium-50 border border-premium-200 rounded-md focus:outline-none focus:ring-1 focus:ring-premium-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-premium-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-premium-900 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
