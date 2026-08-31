import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user, onLogout, addToast }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const formRef = useRef(null);
  const dropdownRef = useRef(null);
  const fireFormRef = useRef(null);
  const [activeSection, setActiveSection] = useState('users');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [fireData, setFireData] = useState([]);
  const [fireSearchQuery, setFireSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterState, setFilterState] = useState('');
  const [fireEditingId, setFireEditingId] = useState(null);
  const [fireFormData, setFireFormData] = useState({
    client_name: '',
    serial_number: '',
    installation_date: '',
    city: '',
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        addToast({ type: 'error', title: 'Access Denied', message: 'Admin privileges required' });
        onLogout();
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/users/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast({ type: 'success', title: 'User Updated', message: `Updated ${formData.username} successfully` });
      } else {
        await axios.post('http://localhost:5000/api/auth/register', {
          ...formData,
          password: formData.password || 'default123'
        });
        addToast({ type: 'success', title: 'User Created', message: `${formData.username} has been added` });
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      addToast({ type: 'error', title: 'Save Failed', message: error.response?.data?.message || 'Could not save user' });
    } finally {
      setIsSubmitting(false);
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
      addToast({ type: 'success', title: 'User Deleted', message: 'The user has been removed' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete the user' });
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', role: 'user', password: '' });
    setEditingId(null);
  };

  const fetchFireData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fire-data/all', {
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
      const response = await axios.get(`http://localhost:5000/api/fire-data/all/search/${fireSearchQuery}`, {
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
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(fireFormData).forEach(key => {
        if (key === 'handover_certificate' && fireFormData[key]) {
          data.append(key, fireFormData[key]);
        } else if (key !== 'handover_certificate' && key !== 'existing_certificate') {
          data.append(key, fireFormData[key]);
        }
      });

      data.append('existing_certificate', fireFormData.existing_certificate || '');
      await axios.put(`http://localhost:5000/api/fire-data/${fireEditingId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addToast({ type: 'success', title: 'Record Updated', message: 'Fire safety record updated successfully' });
      resetFireForm();
      fetchFireData();
    } catch (error) {
      console.error('Error updating fire data:', error);
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not update the record' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFireEdit = (data) => {
    setFireEditingId(data.id);
    setFireFormData({
      client_name: data.client_name,
      serial_number: data.serial_number,
      installation_date: data.installation_date,
      city: data.city || '',
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
      addToast({ type: 'success', title: 'Record Deleted', message: 'Fire safety record has been removed' });
      fetchFireData();
    } catch (error) {
      console.error('Error deleting fire data:', error);
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete the record' });
    }
  };

  const resetFireForm = () => {
    setFireFormData({
      client_name: '', serial_number: '', installation_date: '', city: '', area_name: '',
      district_name: '', state: '', cylinder_size: '', supply_type: 'supply_only',
      handover_certificate: null, invoice_number: '', vehicle_name: 'Kitelen',
      vehicle_number: '', warranty_in_date: '', warranty_over_date: ''
    });
    setFireEditingId(null);
  };

  const cities = useMemo(() => [...new Set(fireData.map(d => d.city).filter(Boolean))], [fireData]);
  const districts = useMemo(() => [...new Set(fireData.map(d => d.district_name).filter(Boolean))], [fireData]);
  const states = useMemo(() => [...new Set(fireData.map(d => d.state).filter(Boolean))], [fireData]);

  const filteredData = useMemo(() => fireData.filter(d => {
    if (filterCity && d.city !== filterCity) return false;
    if (filterDistrict && d.district_name !== filterDistrict) return false;
    if (filterState && d.state !== filterState) return false;
    if (fireSearchQuery.trim()) {
      const q = fireSearchQuery.toLowerCase();
      return (
        (d.client_name || '').toLowerCase().includes(q) ||
        (d.serial_number || '').toLowerCase().includes(q) ||
        (d.city || '').toLowerCase().includes(q) ||
        (d.area_name || '').toLowerCase().includes(q) ||
        (d.district_name || '').toLowerCase().includes(q) ||
        (d.state || '').toLowerCase().includes(q) ||
        (d.invoice_number || '').toLowerCase().includes(q)
      );
    }
    return true;
  }), [fireData, filterCity, filterDistrict, filterState, fireSearchQuery]);

  return (
    <div className="min-h-screen dashboard-bg-admin relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-orange-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-red-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.2s' }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flame-particle"
            style={{
              left: `${(i * 18) + 5}%`,
              width: `${6 + (i % 3) * 3}px`,
              height: `${6 + (i % 3) * 3}px`,
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.85), rgba(249, 115, 22, 0.5), transparent)',
              animationDuration: `${8 + (i % 4) * 1.8}s`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

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
                <p className="text-white/75 text-xs sm:text-sm font-medium">Admin Dashboard</p>
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-300 ring-1 ring-white/20 hover:ring-white/40"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center ring-2 ring-white/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white hidden sm:inline">{user.username}</span>
                <svg className={`w-4 h-4 text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dramatic border border-gray-200/80 z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveSection('users')}
            className={`tab-btn ${activeSection === 'users' ? 'tab-btn-active-fire' : 'tab-btn-inactive'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </button>
          <button
            onClick={() => setActiveSection('fire')}
            className={`tab-btn ${activeSection === 'fire' ? 'tab-btn-active-blue' : 'tab-btn-inactive'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Fire Safety Data
          </button>
        </div>

        {activeSection === 'users' && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="stat-card p-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1.5">{users.length}</p>
              </div>
              <div className="bg-gradient-to-br from-fire-500 to-blaze-600 p-3 rounded-xl shadow-lg shadow-fire-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Admin Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1.5">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Regular Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1.5">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <div className="bg-gradient-to-br from-safety-500 to-safety-700 p-3 rounded-xl shadow-lg shadow-safety-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card p-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">System Status</p>
                <p className="text-2xl font-bold text-safety-600 mt-1.5 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-safety-500"></span>
                  </span>
                  Active
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-xl shadow-lg shadow-purple-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div ref={formRef} className="card p-6 sm:p-8 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-fire-500 to-blaze-600 p-2.5 rounded-xl shadow-lg shadow-fire-500/25">
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
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 rounded-full shadow-md animate-bounce-in">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Editing #{editingId}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group">
                <label className="mb-2 group-focus-within:text-fire-700 transition-colors">Username *</label>
                <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="input-field" placeholder="Enter username" />
              </div>
              <div className="group">
                <label className="mb-2 group-focus-within:text-fire-700 transition-colors">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="input-field" placeholder="Enter email" />
              </div>
              <div className="group">
                <label className="mb-2 group-focus-within:text-fire-700 transition-colors">Role *</label>
                <select name="role" required value={formData.role} onChange={handleInputChange} className="input-field">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="group">
                <label className="mb-2 group-focus-within:text-fire-700 transition-colors">
                  {editingId ? 'New Password (leave blank to keep)' : 'Password'}
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
                  <label className="mb-2">User ID</label>
                  <input type="text" value={`#${editingId}`} readOnly disabled className="input-field bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="btn-fire px-8 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </span>
                ) : editingId ? 'Update User' : 'Add User'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">All Users</h2>
                <p className="text-xs text-gray-500 mt-0.5">All registered users in the system</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 bg-fire-50 text-fire-700 text-sm font-bold px-3.5 py-1.5 rounded-full border border-fire-200">
              <span className="w-2 h-2 rounded-full bg-fire-500 animate-pulse"></span>
              {users.length} users
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200/80 shadow-sm">
            <table className="w-full border-collapse data-table">
              <thead>
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Username</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Created At</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-fire-700 border-b uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="empty-state-icon">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">No users yet</p>
                          <p className="text-sm text-gray-400 mt-1">Add your first user to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((userData) => (
                    <tr key={userData.id}>
                      <td className="px-5 py-3.5 border-b text-sm font-medium text-gray-400">#{userData.id}</td>
                      <td className="px-5 py-3.5 border-b text-sm font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${userData.role === 'admin' ? 'bg-gradient-to-br from-fire-100 to-orange-200' : 'bg-gradient-to-br from-primary-100 to-indigo-200'}`}>
                            <span className={`text-xs font-bold ${userData.role === 'admin' ? 'text-fire-700' : 'text-primary-700'}`}>{userData.username.charAt(0).toUpperCase()}</span>
                          </div>
                          {userData.username}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 border-b text-sm text-gray-600">{userData.email}</td>
                      <td className="px-5 py-3.5 border-b text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          userData.role === 'admin' ? 'bg-fire-50 text-fire-700 border-fire-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {userData.role === 'admin' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                          )}
                          {userData.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 border-b text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(userData.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 border-b text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="action-btn action-btn-edit disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={userData.id === user.id}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(userData.id)}
                            className="action-btn action-btn-delete disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={userData.id === user.id}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          {fireEditingId && (
          <div ref={fireFormRef} className="card p-6 sm:p-8 mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">Edit Fire Safety Data</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update the details of the selected record</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 rounded-full shadow-md animate-bounce-in">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Editing #{fireEditingId}
              </span>
            </div>
            <form onSubmit={handleFireSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[['client_name', 'Client Name *', 'text'], ['serial_number', 'Serial Number *', 'text'], ['installation_date', 'Installation Date *', 'date'],
                  ['city', 'City *', 'text'], ['area_name', 'Area Name *', 'text'], ['district_name', 'District Name *', 'text'], ['state', 'State *', 'text'],
                  ['cylinder_size', 'Cylinder Size *', 'text'], ['invoice_number', 'Invoice Number *', 'text'], ['vehicle_number', 'Vehicle Number *', 'text'],
                  ['warranty_in_date', 'Warranty In Date', 'date'], ['warranty_over_date', 'Warranty Over Date', 'date']
                ].map(([name, label, type]) => (
                  <div key={name} className="group">
                    <label className="mb-2 group-focus-within:text-blue-700 transition-colors">{label}</label>
                    <input type={type} name={name} required={label.includes('*')} value={fireFormData[name]} onChange={handleFireInputChange} className="input-field" />
                  </div>
                ))}
                <div className="group">
                  <label className="mb-2 group-focus-within:text-blue-700 transition-colors">Supply Type *</label>
                  <select name="supply_type" required value={fireFormData.supply_type} onChange={handleFireInputChange} className="input-field">
                    <option value="supply_only">Supply Only</option>
                    <option value="sitc">SITC</option>
                  </select>
                </div>
                <div className="group">
                  <label className="mb-2 group-focus-within:text-blue-700 transition-colors">Upload Certificate</label>
                  <input type="file" name="handover_certificate" accept="image/*,.pdf" onChange={handleFireInputChange} className="input-field" />
                  {fireFormData.existing_certificate && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Current: {fireFormData.existing_certificate}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label className="mb-2 group-focus-within:text-blue-700 transition-colors">Vehicle Name *</label>
                  <select name="vehicle_name" required value={fireFormData.vehicle_name} onChange={handleFireInputChange} className="input-field">
                    <option value="Kitelen">Kitelen</option>
                    <option value="Panel">Panel</option>
                    <option value="TRFS">TRFS</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={isSubmitting} className="btn-blue px-8 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  {isSubmitting ? 'Updating...' : 'Update Record'}
                </button>
                <button type="button" onClick={resetFireForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
          )}

          <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
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
                {filteredData.length} / {fireData.length} records
              </span>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Client, Serial, City, District, State, or Invoice..."
                    value={fireSearchQuery}
                    onChange={(e) => setFireSearchQuery(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
                <button onClick={() => { setFireSearchQuery(''); setFilterCity(''); setFilterDistrict(''); setFilterState(''); fetchFireData(); }} className="btn-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reset Filters
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="input-field pl-10">
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="input-field pl-10">
                    <option value="">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                  </div>
                  <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="input-field pl-10">
                    <option value="">All States</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200/80 shadow-sm">
              <table className="w-full border-collapse data-table">
                <thead>
                  <tr>
                    {['ID', 'Client Name', 'Serial Number', 'City', 'District', 'State', 'Cylinder Size', 'Invoice No.', 'Warranty', 'Actions'].map(col => (
                      <th key={col} className="px-4 py-3.5 text-left text-xs font-bold text-blue-700 border-b uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="empty-state-icon">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">No fire safety records found</p>
                            <p className="text-sm text-gray-400 mt-1">Records entered by users will appear here.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((data) => (
                      <tr key={data.id}>
                        <td className="px-4 py-3.5 border-b text-sm font-medium text-gray-400">#{data.id}</td>
                        <td className="px-4 py-3.5 border-b text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary-700">{data.client_name.charAt(0).toUpperCase()}</span>
                            </div>
                            {data.client_name}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm text-gray-600 font-mono text-xs">{data.serial_number}</td>
                        <td className="px-4 py-3.5 border-b text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {data.city || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-200">
                            {data.area_name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200">
                            {data.district_name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {data.cylinder_size}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm text-gray-600">{data.invoice_number}</td>
                        <td className="px-4 py-3.5 border-b text-sm">
                          {data.warranty_in_date && data.warranty_over_date ? (
                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              {new Date(data.warranty_in_date).toLocaleDateString()} - {new Date(data.warranty_over_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 border-b text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleFireEdit(data)} className="action-btn action-btn-edit">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Edit
                            </button>
                            <button onClick={() => handleFireDelete(data.id)} className="action-btn action-btn-delete">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
