import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flame-particle"
              style={{
                left: `${(i * 8.3) + 4}%`,
                width: `${6 + (i % 4) * 3}px`,
                height: `${6 + (i % 4) * 3}px`,
                background: `radial-gradient(circle, rgba(253, 230, 138, 0.95), rgba(245, 101, 101, 0.6), transparent)`,
                animationDuration: `${6 + (i % 5) * 1.8}s`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center animate-fade-in relative">
          <div className="mb-5 relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto shadow-glow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-9 h-9 text-white/90 animate-flicker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white text-shadow-lg tracking-wide">
            FIRE <span className="text-amber-300">AVENGERS</span>
          </h1>
          <p className="text-white/80 text-sm mt-2 animate-pulse font-medium">
            Igniting your safety dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen dashboard-bg-user relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin/register" 
            element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminRegister onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />} 
          />
          
          {/* User Routes */}
          <Route 
            path="/login" 
            element={user?.role === 'user' ? <Navigate to="/dashboard" replace /> : <UserLogin onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user?.role === 'user' ? <Navigate to="/dashboard" replace /> : <UserRegister onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user?.role === 'user' ? <UserDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
