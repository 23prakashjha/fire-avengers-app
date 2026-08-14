import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function UserLogin({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (response.data.user.role === 'user') {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.user);
        navigate('/dashboard');
      } else {
        setError('Access denied. User login only.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center user-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flame-particle"
            style={{
              left: `${(i * 9.7) + 3}%`,
              width: `${5 + (i % 4) * 2}px`,
              height: `${5 + (i % 4) * 2}px`,
              background: 'radial-gradient(circle, rgba(253, 230, 138, 0.9), rgba(245, 101, 101, 0.5), transparent)',
              animationDuration: `${7 + (i % 5) * 1.6}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative animate-scale-in">
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-indigo-400/60 via-white/20 to-blue-400/60 shadow-2xl">
          <div className="card p-8 sm:p-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-none border-0">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl shadow-primary-500/30 mb-5 animate-float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 font-display tracking-wide">
                <span className="gradient-text">FIRE AVENGERS</span>
              </h2>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                User Portal
              </div>
              <p className="mt-3 text-gray-500 text-sm">
                Sign in to manage fire safety data
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg animate-shake flex items-center gap-2 shadow-md">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    className="input-field pl-11 rounded-xl"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="input-field pl-11 rounded-xl"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg py-3.5 rounded-xl font-display tracking-wide"
              >
                <span className="flex items-center justify-center gap-2">
                  Sign in as User
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>

              <div className="relative flex items-center gap-4 py-1">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors group">
                  Don't have an account? <span className="underline underline-offset-2 group-hover:text-primary-800">Register</span>
                </Link>
                <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-xs font-medium flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></span>
            Protecting lives and property with innovative fire safety solutions
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
