import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin, addToast }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user: loggedInUser } = response.data;
      localStorage.setItem('token', token);
      onLogin(loggedInUser);

      if (loggedInUser.role === 'admin') {
        addToast({ type: 'success', title: 'Admin Access Granted', message: `Welcome, ${loggedInUser.username}` });
        navigate('/admin/dashboard');
      } else {
        addToast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${loggedInUser.username}` });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-400/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-500/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-red-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.5s' }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flame-particle"
            style={{
              left: `${(i * 15) + 5}%`,
              width: `${5 + (i % 3) * 3}px`,
              height: `${5 + (i % 3) * 3}px`,
              background: 'radial-gradient(circle, rgba(253, 230, 138, 0.85), rgba(245, 101, 101, 0.4), transparent)',
              animationDuration: `${7 + (i % 4) * 1.4}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative animate-scale-in">
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-indigo-400/60 via-white/20 to-orange-500/60 shadow-dramatic">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-none border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-orange-50/20 pointer-events-none"></div>

            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-fire-600 rounded-3xl shadow-xl shadow-fire-500/30 mb-5 animate-float relative">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <div className="absolute -inset-1 rounded-3xl bg-fire-400/20 animate-pulse -z-10"></div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 font-display tracking-wide">
                <span className="gradient-text-fire">FIRE AVENGERS</span>
              </h2>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 text-primary-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100/80">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Sign In
              </div>
              <p className="mt-3 text-gray-500 text-sm">
                Access the Fire Avengers safety system
              </p>
            </div>

            <form className="relative space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50/80 backdrop-blur border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-xl animate-shake flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="input-field pl-11 rounded-xl"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="input-field pl-11 rounded-xl"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-fire w-full py-3.5 rounded-xl font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-white/70 text-xs font-medium flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Protecting lives and property with innovative fire safety solutions
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
