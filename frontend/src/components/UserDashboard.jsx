import { useState, useEffect, useMemo } from 'react';
import api from '../api';

function UserDashboard({ user, onLogout }) {
  const [fireData, setFireData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterState, setFilterState] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = null;
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    fetchFireData();
    const handleClickOutside = (e) => {
      if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFireData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/fire-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setFireData(Array.isArray(data) ? data : Array.isArray(data?.fireData) ? data.fireData : []);
    } catch (error) {
      console.error('Error fetching fire data:', error);
    }
  };

  const openView = (data) => {
    setViewData(data);
  };

  const closeView = () => {
    setViewData(null);
  };

  const activeWarranties = useMemo(() => fireData.filter(d => {
    if (!d.warranty_in_date || !d.warranty_over_date) return false;
    const today = new Date();
    return new Date(d.warranty_in_date) <= today && today <= new Date(d.warranty_over_date);
  }).length, [fireData]);

  const cities = useMemo(() => [...new Set(fireData.map(d => d.city).filter(Boolean))], [fireData]);
  const states = useMemo(() => [...new Set(fireData.map(d => d.state).filter(Boolean))], [fireData]);

  const filteredData = useMemo(() => fireData.filter(d => {
    if (filterCity && d.city !== filterCity) return false;
    if (filterState && d.state !== filterState) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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
  }), [fireData, filterCity, filterState, searchQuery]);

  return (
    <div className="min-h-screen dashboard-bg-user relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-sky-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.4s' }}></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-fuchsia-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.2s' }}></div>
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
              background: 'radial-gradient(circle, rgba(253, 230, 138, 0.85), rgba(245, 101, 101, 0.45), transparent)',
              animationDuration: `${8 + (i % 4) * 1.8}s`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

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
                <p className="text-white/75 text-xs sm:text-sm font-medium">User Dashboard</p>
              </div>
            </div>
            <div className="relative">
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
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500">Regular User</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {[
            { label: 'Total Records', value: fireData.length, color: 'from-primary-500 to-primary-700', shadow: 'shadow-primary-500/25', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Active Warranties', value: activeWarranties, color: 'from-safety-500 to-safety-700', shadow: 'shadow-safety-500/25', valueColor: 'text-safety-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { label: 'States Covered', value: states.length, color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/25', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'SITC Installations', value: fireData.filter(d => d.supply_type === 'sitc').length, color: 'from-blaze-500 to-blaze-700', shadow: 'shadow-blaze-500/25', valueColor: 'text-blaze-600', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' }
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.valueColor || 'text-gray-900'} mt-1.5`}>{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg ${stat.shadow}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">Fire Safety Data</h2>
                <p className="text-xs text-gray-500 mt-0.5">Browse and search all fire safety records</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-bold px-3.5 py-1.5 rounded-full border border-primary-200">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
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
                  placeholder="Search by Client, City, or State..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
              <button onClick={() => { setSearchQuery(''); setFilterCity(''); setFilterState(''); fetchFireData(); }} className="btn-secondary">
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
                  {['Client Name', 'City', 'State', 'Actions'].map(col => (
                    <th key={col} className="px-4 py-3.5 text-left text-xs font-bold text-primary-700 border-b uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="empty-state-icon">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">No data found</p>
                          <p className="text-sm text-gray-400 mt-1">No fire safety records available yet.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data) => (
                    <tr key={data.id}>
                      <td className="px-4 py-3.5 border-b text-sm font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-700">{(data.client_name || '?').charAt(0).toUpperCase()}</span>
                          </div>
                          {data.client_name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 border-b text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {data.city || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200">
                          {data.state}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b text-sm">
                        <button onClick={() => openView(data)} className="action-btn bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0a9 9 0 0118 0 9 9 0 01-18 0z" /></svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeView}></div>
          <div className="relative bg-white rounded-2xl shadow-dramatic w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0a9 9 0 0118 0 9 9 0 01-18 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold font-display">Fire Safety Data Details</h3>
                  <p className="text-white/70 text-xs">Record #{viewData.id} • Created {new Date(viewData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={closeView} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Client Name', value: viewData.client_name || '-' },
                  { label: 'Serial Number', value: viewData.serial_number || '-' },
                  { label: 'Installation Date', value: viewData.installation_date ? new Date(viewData.installation_date).toLocaleDateString() : '-' },
                  { label: 'City', value: viewData.city || '-' },
                  { label: 'Area Name', value: viewData.area_name || '-' },
                  { label: 'District Name', value: viewData.district_name || '-' },
                  { label: 'State', value: viewData.state || '-' },
                  { label: 'Cylinder Size', value: viewData.cylinder_size || '-' },
                  { label: 'Supply Type', value: viewData.supply_type === 'sitc' ? 'SITC' : 'Supply Only' },
                  { label: 'Invoice Number', value: viewData.invoice_number || '-' },
                  { label: 'Vehicle Name', value: viewData.vehicle_name || '-' },
                  { label: 'Vehicle Number', value: viewData.vehicle_number || '-' },
                  { label: 'Warranty In Date', value: viewData.warranty_in_date ? new Date(viewData.warranty_in_date).toLocaleDateString() : '-' },
                  { label: 'Warranty Over Date', value: viewData.warranty_over_date ? new Date(viewData.warranty_over_date).toLocaleDateString() : '-' },
                  { label: 'Last Updated', value: viewData.updated_at ? new Date(viewData.updated_at).toLocaleString() : '-' }
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-primary-300 transition-all">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-primary-600 uppercase tracking-wider mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"></span>
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 break-words">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-gradient-to-br from-gray-50 to-indigo-50/50 border border-gray-100 rounded-2xl px-5 py-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-primary-600 uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-safety-500 to-blue-500"></span>
                  Handover Certificate
                </p>
                {viewData.handover_certificate ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {viewData.handover_certificate.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-20 h-20 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-9 h-9 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm8 7a1 1 0 00-1-1H7a1 1 0 000 2h6a1 1 0 001-1zm-1 4a1 1 0 110 2H7a1 1 0 010-2h6zm4 5a1 1 0 01-1 1H7a1 1 0 010-2h9a1 1 0 011 1z" clipRule="evenodd" /></svg>
                      </div>
                    ) : (
                      <img
                        src={`/uploads/${viewData.handover_certificate}`}
                        alt="Handover certificate"
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0 shadow-sm"
                      />
                    )}
                    <a
                      href={`/uploads/${viewData.handover_certificate}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      View Certificate
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No certificate uploaded</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
                <button onClick={closeView} className="btn-primary bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg px-6">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
