import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

const toastIcons = {
  success: { bg: 'bg-green-100', text: 'text-green-600', path: 'M5 13l4 4L19 7' },
  error: { bg: 'bg-red-100', text: 'text-red-600', path: 'M6 18L18 6M6 6l12 12' },
  info: { bg: 'bg-indigo-100', text: 'text-indigo-600', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-600', path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
};

const Toast = memo(function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const icon = toastIcons[toast.type] || toastIcons.info;
        return (
          <div
            key={toast.id}
            className={`toast ${toast.exiting ? 'toast-exit' : ''} toast-${toast.type}`}
            onClick={() => onRemove(toast.id)}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className={`w-7 h-7 rounded-full ${icon.bg} flex items-center justify-center`}>
                <svg className={`w-4 h-4 ${icon.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon.path} />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flame-particle"
              style={{
                left: `${(i * 12) + 3}%`,
                width: `${6 + (i % 3) * 4}px`,
                height: `${6 + (i % 3) * 4}px`,
                background: `radial-gradient(circle, rgba(253, 230, 138, ${0.7 + (i % 3) * 0.1}), rgba(245, 101, 101, 0.5), transparent)`,
                animationDuration: `${5 + (i % 4) * 1.5}s`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="text-center animate-scale-in relative">
          <div className="mb-6 relative inline-block">
            <div className="w-24 h-24 border-[3px] border-white/15 border-t-white/90 rounded-full mx-auto shadow-glow" style={{ animation: 'spinSlow 1.8s linear infinite' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/95 animate-flicker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white text-shadow-lg tracking-wider mb-2">
            FIRE <span className="text-amber-300">AVENGERS</span>
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-3"></div>
          <p className="text-white/70 text-sm font-medium" style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}>
            Initializing safety dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen dashboard-bg-user relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route 
            path="/admin/login" 
            element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} addToast={addToast} />} 
          />
          <Route 
            path="/admin/register" 
            element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminRegister onLogin={handleLogin} addToast={addToast} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} addToast={addToast} /> : <Navigate to="/admin/login" replace />} 
          />
          
          <Route 
            path="/login" 
            element={user?.role === 'user' ? <Navigate to="/dashboard" replace /> : <UserLogin onLogin={handleLogin} addToast={addToast} />} 
          />
          <Route 
            path="/register" 
            element={user?.role === 'user' ? <Navigate to="/dashboard" replace /> : <UserRegister onLogin={handleLogin} addToast={addToast} />} 
          />
          <Route 
            path="/dashboard" 
            element={user?.role === 'user' ? <UserDashboard user={user} onLogout={handleLogout} addToast={addToast} /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
