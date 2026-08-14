import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const formRef = useRef(null);
  const fireFormRef = useRef(null);
  const [activeSection, setActiveSection] = useState('users');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [fireData, setFireData] = useState([]);
  const [fireSearchQuery, setFireSearchQuery] = useState('');
  const [fireEditingId, setFireEditingId] = useState(null);
  const [fireFormData, setFireFormData] = useState({
    client_name: '',
    serial_number: '',
    installation_date: '',
    area_name: '',
    district_name: '',
    state: '',
    cylinder_size: '',
    supply_type: 'supply_only',
    handover_certificate: null,
    invoice_number: '',
    vehicle_name: 'Kitelen',
    vehicle_number: '',
    warranty_in_date: '',
    warranty_over_date: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchFireData();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin only.');
        onLogout();
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/users/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // For creating new users, we need to use the auth register endpoint
        await axios.post('http://localhost:5000/api/auth/register', {
          ...formData,
          password: formData.password || 'default123' // Default password for admin-created users
        });
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Please try again.');
    }
  };

  const handleEdit = (userData) => {
    setEditingId(userData.id);
    setFormData({
      username: userData.username,
      email: userData.email,
      role: userData.role,
      password: ''
    });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user',
      password: ''
    });
    setEditingId(null);
  };

  const fetchFireData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fire-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFireData(response.data);
    } catch (error) {
      console.error('Error fetching fire data:', error);
    }
  };

  const handleFireSearch = async () => {
    if (!fireSearchQuery.trim()) {
      fetchFireData();
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/fire-data/search/${fireSearchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFireData(response.data);
    } catch (error) {
      console.error('Error searching fire data:', error);
    }
  };

  const handleFireInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'handover_certificate') {
      setFireFormData({ ...fireFormData, handover_certificate: files[0] });
    } else {
      setFireFormData({ ...fireFormData, [name]: value });
    }
  };

  const handleFireSubmit = async (e) => {
    e.preventDefault();
    if (!fireEditingId) return;
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(fireFormData).forEach(key => {
        if (key === 'handover_certificate' && fireFormData[key]) {
          data.append(key, fireFormData[key]);
        } else if (key !== 'handover_certificate') {
          data.append(key, fireFormData[key]);
        }
      });

      data.append('existing_certificate', fireFormData.existing_certificate || '');
      await axios.put(`http://localhost:5000/api/fire-data/${fireEditingId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      resetFireForm();
      fetchFireData();
    } catch (error) {
      console.error('Error updating fire data:', error);
      alert('Error updating fire data. Please try again.');
    }
  };

  const handleFireEdit = (data) => {
    setFireEditingId(data.id);
    setFireFormData({
      client_name: data.client_name,
      serial_number: data.serial_number,
      installation_date: data.installation_date,
      area_name: data.area_name,
      district_name: data.district_name,
      state: data.state,
      cylinder_size: data.cylinder_size,
      supply_type: data.supply_type,
      handover_certificate: null,
      existing_certificate: data.handover_certificate,
      invoice_number: data.invoice_number,
      vehicle_name: data.vehicle_name,
      vehicle_number: data.vehicle_number,
      warranty_in_date: data.warranty_in_date || '',
      warranty_over_date: data.warranty_over_date || ''
    });
    setTimeout(() => {
      fireFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFireDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fire safety record?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/fire-data/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFireData();
    } catch (error) {
      console.error('Error deleting fire data:', error);
      alert('Error deleting fire data. Please try again.');
    }
  };

  const resetFireForm = () => {
    setFireFormData({
      client_name: '',
      serial_number: '',
      installation_date: '',
      area_name: '',
      district_name: '',
      state: '',
      cylinder_size: '',
      supply_type: 'supply_only',
      handover_certificate: null,
      invoice_number: '',
      vehicle_name: 'Kitelen',
      vehicle_number: '',
      warranty_in_date: '',
      warranty_over_date: ''
    });
    setFireEditingId(null);
  };

  return (
    <div className="min-h-screen dashboard-bg-admin relative overflow-hidden">
      {/* Animated glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-amber-300/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.2s' }}></div>
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
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.85), rgba(249, 115, 22, 0.5), transparent)',
              animationDuration: `${8 + (i % 5) * 1.8}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="admin-gradient sticky top-0 z-40 shadow-xl shadow-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-inner ring-1 ring-white/30 animate-float">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-white">
                  FIRE <span className="text-amber-300">AVENGERS</span>
                </h1>
                <p className="text-white/80 text-xs sm:text-sm font-medium">Admin Dashboard</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl backdrop-blur-sm transition-all ring-1 ring-white/20 hover:ring-white/40"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center ring-2 ring-white/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">{user.username}</span>
                <svg className={`w-4 h-4 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Section Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveSection('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md ${
              activeSection === 'users'
                ? 'bg-gradient-to-r from-fire-600 to-blaze-600 text-white shadow-lg shadow-fire-500/30 ring-1 ring-fire-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </button>
          <button
            onClick={() => setActiveSection('fire')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md ${
              activeSection === 'fire'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Fire Safety Data
          </button>
        </div>

        {activeSection === 'users' && (
        <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="bg-gradient-to-br from-fire-500 to-blaze-600 p-3 rounded-xl shadow-lg shadow-fire-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Admin Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Regular Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <div className="bg-gradient-to-br from-safety-500 to-safety-700 p-3 rounded-xl shadow-lg shadow-safety-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">System Status</p>
                <p className="text-2xl sm:text-3xl font-bold text-safety-600 mt-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-safety-500 animate-pulse"></span>
                  Active
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-xl shadow-lg shadow-purple-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Form */}
        <div ref={formRef} className="card p-6 sm:p-8 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-fire-500 to-blaze-600 p-2.5 rounded-xl shadow-lg shadow-fire-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">
                  {editingId ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Create or update user accounts in the system</p>
              </div>
            </div>
            {editingId && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 rounded-full shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                Editing User #{editingId}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Role *</label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingId ? 'Enter new password...' : 'Set password'}
                  className="input-field"
                />
              </div>
              {editingId && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">User ID</label>
                  <input
                    type="text"
                    value={`#${editingId}`}
                    readOnly
                    disabled
                    className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="btn-fire px-8"
              >
                {editingId ? 'Update User' : 'Add User'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">User Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">All registered users in the system</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 bg-fire-50 text-fire-700 text-sm font-bold px-3.5 py-1.5 rounded-full border border-fire-200">
              <span className="w-2 h-2 rounded-full bg-fire-500 animate-pulse"></span>
              {users.length} users
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full border-collapse data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="font-medium text-gray-600">No users found</p>
                        <p className="text-sm text-gray-400">Add your first user to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((userData) => (
                    <tr key={userData.id} className="transition-colors">
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm font-medium text-gray-500">#{userData.id}</td>
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${userData.role === 'admin' ? 'bg-gradient-to-br from-fire-100 to-orange-200' : 'bg-gradient-to-br from-primary-100 to-indigo-200'}`}>
                            <span className={`text-xs font-bold ${userData.role === 'admin' ? 'text-fire-700' : 'text-primary-700'}`}>{userData.username.charAt(0).toUpperCase()}</span>
                          </div>
                          {userData.username}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm text-gray-600">{userData.email}</td>
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          userData.role === 'admin' 
                            ? 'bg-fire-50 text-fire-700 border-fire-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            {userData.role === 'admin' ? (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            )}
                          </svg>
                          {userData.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(userData.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b text-xs sm:text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="text-fire-600 hover:text-fire-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 bg-fire-50 hover:bg-fire-100 px-2.5 py-1.5 rounded-lg disabled:bg-gray-50 disabled:text-gray-400"
                            disabled={userData.id === user.id}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(userData.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg disabled:bg-gray-50 disabled:text-gray-400"
                            disabled={userData.id === user.id}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {activeSection === 'fire' && (
          <>
          {/* Fire Safety Data Edit Form (only shown while editing) */}
          {fireEditingId && (
          <div ref={fireFormRef} className="card p-6 sm:p-8 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">
                    Edit Fire Safety Data
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update the details of the selected record</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 rounded-full shadow-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                Editing Record #{fireEditingId}
              </span>
            </div>
            <form onSubmit={handleFireSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Client Name *</label>
                  <input type="text" name="client_name" required value={fireFormData.client_name} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Serial Number *</label>
                  <input type="text" name="serial_number" required value={fireFormData.serial_number} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Installation Date *</label>
                  <input type="date" name="installation_date" required value={fireFormData.installation_date} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Area Name *</label>
                  <input type="text" name="area_name" required value={fireFormData.area_name} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">District Name *</label>
                  <input type="text" name="district_name" required value={fireFormData.district_name} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">State *</label>
                  <input type="text" name="state" required value={fireFormData.state} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Cylinder Size *</label>
                  <input type="text" name="cylinder_size" required value={fireFormData.cylinder_size} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Supply Type *</label>
                  <select name="supply_type" required value={fireFormData.supply_type} onChange={handleFireInputChange} className="input-field">
                    <option value="supply_only">Supply Only</option>
                    <option value="sitc">SITC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Upload Handover Certificate</label>
                  <input type="file" name="handover_certificate" accept="image/*,.pdf" onChange={handleFireInputChange} className="input-field" />
                  {fireFormData.existing_certificate && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Current: {fireFormData.existing_certificate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Invoice Number *</label>
                  <input type="text" name="invoice_number" required value={fireFormData.invoice_number} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Vehicle Name *</label>
                  <select name="vehicle_name" required value={fireFormData.vehicle_name} onChange={handleFireInputChange} className="input-field">
                    <option value="Kitelen">Kitelen</option>
                    <option value="Panel">Panel</option>
                    <option value="TRFS">TRFS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Vehicle Number *</label>
                  <input type="text" name="vehicle_number" required value={fireFormData.vehicle_number} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Warranty In Date</label>
                  <input type="date" name="warranty_in_date" value={fireFormData.warranty_in_date} onChange={handleFireInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Warranty Over Date</label>
                  <input type="date" name="warranty_over_date" value={fireFormData.warranty_over_date} onChange={handleFireInputChange} className="input-field" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="submit" className="btn-blue px-8">
                  Update
                </button>
                <button type="button" onClick={resetFireForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
          )}

          {/* Fire Safety Data Table */}
          <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">Fire Safety Records</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Browse, search and manage all fire safety records</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-bold px-3.5 py-1.5 rounded-full border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                {fireData.length} records
              </span>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Client Name, Serial Number, State, or Invoice..."
                  value={fireSearchQuery}
                  onChange={(e) => setFireSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFireSearch()}
                  className="input-field pl-11"
                />
              </div>
              <button onClick={handleFireSearch} className="btn-blue shadow-lg">
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </span>
              </button>
              <button onClick={fetchFireData} className="btn-secondary">
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Client Name</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Serial Number</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Cylinder Size</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Invoice Number</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Warranty</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fireData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="font-medium text-gray-600">No fire safety records found</p>
                          <p className="text-sm text-gray-400">Records entered by users will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fireData.map((data) => (
                      <tr key={data.id} className="transition-colors">
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm font-medium text-gray-500">#{data.id}</td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary-700">{data.client_name.charAt(0).toUpperCase()}</span>
                            </div>
                            {data.client_name}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm text-gray-600 font-mono">{data.serial_number}</td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm text-gray-600">
                          <div className="max-w-xs truncate">{data.area_name}, {data.district_name}, {data.state}</div>
                        </td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {data.cylinder_size}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm text-gray-600">{data.invoice_number}</td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm">
                          {data.warranty_in_date && data.warranty_over_date ? (
                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {new Date(data.warranty_in_date).toLocaleDateString()} - {new Date(data.warranty_over_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 border-b text-xs sm:text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleFireEdit(data)} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => handleFireDelete(data.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
