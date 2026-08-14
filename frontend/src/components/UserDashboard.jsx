import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' or 'display'
  const [fireData, setFireData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const formRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
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
    fetchFireData();
  }, []);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFireData();
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/fire-data/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFireData(response.data);
    } catch (error) {
      console.error('Error searching fire data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'handover_certificate') {
      setFormData({ ...formData, handover_certificate: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'handover_certificate' && formData[key]) {
          data.append(key, formData[key]);
        } else if (key !== 'handover_certificate') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        data.append('existing_certificate', formData.existing_certificate || '');
        await axios.put(`http://localhost:5000/api/fire-data/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/fire-data', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      resetForm();
      fetchFireData();
    } catch (error) {
      console.error('Error saving fire data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setFormData({
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
    setActiveTab('entry');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/fire-data/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFireData();
    } catch (error) {
      console.error('Error deleting fire data:', error);
      alert('Error deleting data. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingId(null);
  };

  const activeWarranties = fireData.filter(d => {
    if (!d.warranty_in_date || !d.warranty_over_date) return false;
    const today = new Date();
    return new Date(d.warranty_in_date) <= today && today <= new Date(d.warranty_over_date);
  }).length;

  const states = [...new Set(fireData.map(d => d.state).filter(Boolean))];

  return (
    <div className="min-h-screen dashboard-bg-user relative overflow-hidden">
      {/* Animated glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-fuchsia-300/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.2s' }}></div>
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
              background: 'radial-gradient(circle, rgba(253, 230, 138, 0.85), rgba(245, 101, 101, 0.45), transparent)',
              animationDuration: `${8 + (i % 5) * 1.8}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="user-gradient sticky top-0 z-40 shadow-xl shadow-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-inner ring-1 ring-white/30 animate-float">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-wide text-white">
                  FIRE <span className="text-amber-300">AVENGERS</span>
                </h1>
                <p className="text-white/80 text-xs sm:text-sm font-medium">User Dashboard</p>
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
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">Regular User</p>
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
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md ${
              activeTab === 'entry' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 ring-1 ring-primary-400' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Data Entry
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md ${
              activeTab === 'display' 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 ring-1 ring-primary-400' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Data Display & Search
          </button>
        </div>

        {activeTab === 'entry' && (
          <div ref={formRef} className="card p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">
                    {editingId ? 'Edit Fire Safety Data' : 'Add New Fire Safety Data'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Fill in the details below to record installation information</p>
                </div>
              </div>
              {editingId && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 rounded-full shadow-md animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Editing Record #{editingId}
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Client Name *</label>
                  <input
                    type="text"
                    name="client_name"
                    required
                    value={formData.client_name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Serial Number *</label>
                  <input
                    type="text"
                    name="serial_number"
                    required
                    value={formData.serial_number}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Installation Date *</label>
                  <input
                    type="date"
                    name="installation_date"
                    required
                    value={formData.installation_date}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Area Name *</label>
                  <input
                    type="text"
                    name="area_name"
                    required
                    value={formData.area_name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">District Name *</label>
                  <input
                    type="text"
                    name="district_name"
                    required
                    value={formData.district_name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Cylinder Size *</label>
                  <input
                    type="text"
                    name="cylinder_size"
                    required
                    value={formData.cylinder_size}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Supply Type *</label>
                  <select
                    name="supply_type"
                    required
                    value={formData.supply_type}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="supply_only">Supply Only</option>
                    <option value="sitc">SITC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Upload Handover Certificate</label>
                  <input
                    type="file"
                    name="handover_certificate"
                    accept="image/*,.pdf"
                    onChange={handleInputChange}
                    className="input-field"
                  />
                  {formData.existing_certificate && (
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Current: {formData.existing_certificate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Invoice Number *</label>
                  <input
                    type="text"
                    name="invoice_number"
                    required
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Vehicle Name *</label>
                  <select
                    name="vehicle_name"
                    required
                    value={formData.vehicle_name}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Kitelen">Kitelen</option>
                    <option value="Panel">Panel</option>
                    <option value="TRFS">TRFS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicle_number"
                    required
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Warranty In Date</label>
                  <input
                    type="date"
                    name="warranty_in_date"
                    value={formData.warranty_in_date}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Warranty Over Date</label>
                  <input
                    type="date"
                    name="warranty_over_date"
                    value={formData.warranty_over_date}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="btn-primary bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg px-8"
                >
                  <span className="flex items-center gap-2">
                    {editingId ? 'Update' : 'Submit'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { resetForm(); setActiveTab('display'); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'display' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="stat-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Records</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{fireData.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-xl shadow-lg shadow-primary-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Active Warranties</p>
                    <p className="text-2xl sm:text-3xl font-bold text-safety-600 mt-1">{activeWarranties}</p>
                  </div>
                  <div className="bg-gradient-to-br from-safety-500 to-safety-700 p-3 rounded-xl shadow-lg shadow-safety-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">States Covered</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{states.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">SITC Installations</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blaze-600 mt-1">{fireData.filter(d => d.supply_type === 'sitc').length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blaze-500 to-blaze-700 p-3 rounded-xl shadow-lg shadow-blaze-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">Data Display & Search</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Browse, search and manage all fire safety records</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-bold px-3.5 py-1.5 rounded-full border border-primary-200">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                  {fireData.length} records
                </span>
              </div>
              
              {/* Search Section */}
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Client Name, Serial Number, State, or Invoice Number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-field pl-11"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="btn-primary bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </span>
                </button>
                <button
                  onClick={fetchFireData}
                  className="btn-secondary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full border-collapse data-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Client Name</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Serial Number</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Cylinder Size</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Invoice Number</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Warranty</th>
                      <th className="px-4 py-3.5 text-left text-xs sm:text-xs font-bold text-primary-700 border-b uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fireData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="font-medium text-gray-600">No data found</p>
                            <p className="text-sm text-gray-400">Add your first fire safety record to get started.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fireData.map((data) => (
                        <tr key={data.id} className="transition-colors">
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
                              <button
                                onClick={() => handleEdit(data)}
                                className="text-primary-600 hover:text-primary-800 font-semibold transition-colors flex items-center gap-1 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(data.id)}
                                className="text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg"
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
      </div>
    </div>
  );
}

export default UserDashboard;
