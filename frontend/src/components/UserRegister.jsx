import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function UserRegister({ onLogin, addToast }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' };
    return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'user'
      });
      
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      localStorage.setItem('token', loginResponse.data.token);
      onLogin(loginResponse.data.user);
      addToast({ type: 'success', title: 'Account Created!', message: 'Welcome to Fire Avengers' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center user-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-400/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-indigo-400/50 via-white/20 to-blue-400/50 shadow-dramatic">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-none border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-blue-50/20 pointer-events-none"></div>
            
            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl shadow-primary-500/30 mb-5 animate-float relative">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <div className="absolute -inset-1 rounded-3xl bg-primary-400/20 animate-pulse -z-10"></div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 font-display tracking-wide">
                <span className="gradient-text">FIRE AVENGERS</span>
              </h2>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 text-primary-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100/80">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Create Account
              </div>
              <p className="mt-3 text-gray-500 text-sm">Join the Fire Avengers community today</p>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input name="username" type="text" required className="input-field pl-11 rounded-xl" placeholder="Choose a username" value={formData.username} onChange={handleChange} autoFocus />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input name="email" type="email" required className="input-field pl-11 rounded-xl" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input name="password" type="password" required className="input-field pl-11 rounded-xl" placeholder="Create a password" value={formData.password} onChange={handleChange} />
                </div>
                {formData.password && (
                  <div className="space-y-2 -mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : ''}`}></div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      Password strength: <span className="font-semibold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-primary-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className={`input-field pl-11 rounded-xl ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/12' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg py-3.5 rounded-xl font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Register as User
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <div className="relative flex items-center gap-4 py-1">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors group">
                  Already have an account? <span className="underline underline-offset-2 group-hover:text-primary-800">Sign in</span>
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

        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-white/70 text-xs font-medium flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Join the Fire Avengers community today
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;
