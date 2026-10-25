import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import NotificationPanel from './NotificationPanel';
import ShiftPanel from './ShiftPanel';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Panels state
  const [activePanel, setActivePanel] = useState(null); // 'notifications' | 'shift' | 'profile' | null
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Alerts badge count
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [latestReadings, setLatestReadings] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);

  const searchRef = useRef(null);
  const headerActionsRef = useRef(null);

  // Fetch initial unread alerts count & search indices
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [alertsRes, readingsRes] = await Promise.all([
          api.get('/alerts/active'),
          api.get('/readings/latest')
        ]);
        setActiveAlertsCount(alertsRes.data?.length || 0);
        setRecentAlerts(alertsRes.data || []);
        setLatestReadings(readingsRes.data || null);
      } catch (err) {
        console.error('Navbar initial data error:', err);
      }
    };

    fetchInitialData();

    // Socket events for real-time alert count & reading updates
    const handleNewAlert = (alert) => {
      setActiveAlertsCount(prev => prev + 1);
      setRecentAlerts(prev => [alert, ...prev]);
    };

    const handleAlertResolved = (resolved) => {
      setActiveAlertsCount(prev => Math.max(0, prev - 1));
      setRecentAlerts(prev => prev.filter(a => a._id !== resolved._id));
    };

    const handleSensorUpdate = (data) => {
      setLatestReadings(data);
    };

    socket.on('newAlert', handleNewAlert);
    socket.on('alertResolved', handleAlertResolved);
    socket.on('sensorUpdate', handleSensorUpdate);

    return () => {
      socket.off('newAlert', handleNewAlert);
      socket.off('alertResolved', handleAlertResolved);
      socket.off('sensorUpdate', handleSensorUpdate);
    };
  }, []);

  // Close panels on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerActionsRef.current && !headerActionsRef.current.contains(e.target)) {
        setActivePanel(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execute Search query across pages, sensors, and alerts
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const results = [];

    // 1. Search Dashboard Pages & Sections
    const pages = [
      { name: 'Dashboard Overview', path: '/', category: 'PAGE', desc: 'Real-time telemetry and plant health status' },
      { name: 'Live Monitoring Area', path: '/live', category: 'PAGE', desc: 'Live circuit data stream and interactive chart' },
      { name: 'Alerts Management', path: '/alerts', category: 'PAGE', desc: 'Active & resolved plant threshold anomalies' },
      { name: 'Historical Data Log', path: '/history', category: 'PAGE', desc: 'Query and export sensor telemetry logs' },
      { name: 'Analytics & Trends', path: '/analytics', category: 'PAGE', desc: 'Long-term trend evaluations and statistical metrics' },
    ];

    if (user?.role === 'Admin') {
      pages.push({ name: 'System Settings', path: '/settings', category: 'PAGE', desc: 'Configure sensor thresholds & simulator' });
      pages.push({ name: 'User Management', path: '/users', category: 'PAGE', desc: 'Manage operators, analysts, and access permissions' });
    }

    pages.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        results.push(p);
      }
    });

    // 2. Search Sensor Parameters
    const sensors = [
      { name: 'pH Level', key: 'ph', unit: 'pH', value: latestReadings?.ph, path: '/live', category: 'SENSOR' },
      { name: 'Temperature', key: 'temperature', unit: '°C', value: latestReadings?.temperature, path: '/live', category: 'SENSOR' },
      { name: 'Turbidity', key: 'turbidity', unit: 'NTU', value: latestReadings?.turbidity, path: '/live', category: 'SENSOR' },
      { name: 'Water Level', key: 'waterLevel', unit: '%', value: latestReadings?.waterLevel, path: '/live', category: 'SENSOR' },
      { name: 'Flow Rate', key: 'flowRate', unit: 'L/min', value: latestReadings?.flowRate, path: '/live', category: 'SENSOR' },
    ];

    sensors.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q)) {
        results.push({
          name: `${s.name}: ${s.value !== undefined ? s.value.toFixed?.(2) ?? s.value : '--'} ${s.unit}`,
          path: s.path,
          category: s.category,
          desc: `Current sensor telemetry value: ${s.value !== undefined ? s.value.toFixed?.(2) ?? s.value : '--'} ${s.unit}`
        });
      }
    });

    // 3. Search Alerts
    recentAlerts.forEach(a => {
      if (
        a.parameter?.toLowerCase().includes(q) ||
        a.message?.toLowerCase().includes(q) ||
        a.severity?.toLowerCase().includes(q)
      ) {
        results.push({
          name: `${a.parameter} ${a.severity} Alert`,
          path: '/alerts',
          category: 'ALERT',
          desc: a.message
        });
      }
    });

    setSearchResults(results);
    setIsSearchOpen(true);
  }, [searchQuery, latestReadings, recentAlerts, user]);

  const togglePanel = (panelName) => {
    setActivePanel(prev => prev === panelName ? null : panelName);
  };

  const handleSelectSearchResult = (path) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-surface border-b border-outline-variant z-40">
        <div className="flex justify-between items-center px-gutter w-full h-full">
          {/* Brand/Product Name (Desktop only) */}
          <div className="font-headline-sm text-headline-sm font-black text-on-surface hidden lg:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>System Online</span>
          </div>
          
          {/* Working Search Bar (Recreated matching Screenshot 3) */}
          <div ref={searchRef} className="flex-1 max-w-md mx-4 lg:mx-8 relative">
            <div className="relative bg-surface-container-low rounded-lg border border-outline-variant/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setIsSearchOpen(true)}
                className="w-full bg-transparent border-none text-on-surface font-label-mono text-label-mono py-2 pl-10 pr-8 focus:ring-0 outline-none placeholder-on-surface-variant/50" 
                placeholder="Search systems, alerts..." 
                type="text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-12 bg-[#1E293B] border border-outline-variant rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-on-surface-variant font-label-mono text-xs">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/30">
                    {searchResults.map((res, index) => {
                      const categoryBadgeColor = 
                        res.category === 'ALERT'
                          ? 'bg-error/20 text-error border-error/40'
                          : res.category === 'SENSOR'
                          ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                          : 'bg-primary/20 text-primary border-primary/40';

                      return (
                        <div
                          key={index}
                          onClick={() => handleSelectSearchResult(res.path)}
                          className="p-3 hover:bg-surface-container/60 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[9px] font-label-mono px-1.5 py-0.5 rounded border uppercase ${categoryBadgeColor}`}>
                                {res.category}
                              </span>
                              <p className="font-label-sm text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                                {res.name}
                              </p>
                            </div>
                            <p className="font-body-md text-xs text-on-surface-variant truncate">
                              {res.desc}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_forward
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Header Action Icons (Recreated matching Screenshot 2 with working functionality) */}
          <div ref={headerActionsRef} className="flex items-center gap-2 relative">
            {/* 1. Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => togglePanel('notifications')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 active:opacity-80 relative ${
                  activePanel === 'notifications'
                    ? 'bg-surface-container-high text-primary ring-1 ring-primary/40'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                title="Active Alerts & Notifications"
                aria-label="Active Alerts"
              >
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                {activeAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-on-error rounded-full font-label-mono text-[10px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(255,180,171,0.8)] animate-pulse">
                    {activeAlertsCount}
                  </span>
                )}
              </button>
              <NotificationPanel 
                isOpen={activePanel === 'notifications'} 
                onClose={() => setActivePanel(null)} 
              />
            </div>

            {/* 2. Clock / Schedule Icon */}
            <div className="relative">
              <button 
                onClick={() => togglePanel('shift')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 active:opacity-80 relative ${
                  activePanel === 'shift'
                    ? 'bg-surface-container-high text-primary ring-1 ring-primary/40'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                title="Shift Roster & Plant Clock"
                aria-label="Shift & Time Information"
              >
                <span className="material-symbols-outlined" data-icon="schedule">schedule</span>
              </button>
              <ShiftPanel 
                isOpen={activePanel === 'shift'} 
                onClose={() => setActivePanel(null)} 
              />
            </div>

            {/* 3. User / Profile Icon */}
            <div className="relative">
              <button 
                onClick={() => togglePanel('profile')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 active:opacity-80 relative ${
                  activePanel === 'profile'
                    ? 'bg-surface-container-high text-primary ring-1 ring-primary/40'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                title="User Profile & Session Settings"
                aria-label="User Profile"
              >
                <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
              </button>

              {/* Profile Dropdown Menu */}
              {activePanel === 'profile' && (
                <div className="absolute right-0 top-12 w-64 bg-[#1E293B] border border-outline-variant rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                  {/* User Header */}
                  <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/60">
                    <div className="font-semibold text-on-surface text-sm truncate">
                      {user?.name || 'Authorized Operator'}
                    </div>
                    <div className="font-label-mono text-[11px] text-on-surface-variant truncate">
                      {user?.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-mono uppercase bg-primary/20 text-primary border border-primary/30">
                        {user?.role}
                      </span>
                      <span className="text-[10px] font-label-mono text-on-surface-variant">
                        Shift {user?.shift || 'A'}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1 font-label-sm text-xs">
                    <button
                      onClick={() => {
                        setActivePanel(null);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-base text-primary">person</span>
                      <span>Profile & Permissions</span>
                    </button>

                    {user?.role === 'Admin' && (
                      <>
                        <button
                          onClick={() => {
                            setActivePanel(null);
                            navigate('/users');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-base text-primary">manage_accounts</span>
                          <span>User Management</span>
                        </button>
                        <button
                          onClick={() => {
                            setActivePanel(null);
                            navigate('/settings');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-base text-primary">settings</span>
                          <span>System Settings</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-outline-variant/40 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setActivePanel(null);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Details Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Navbar;
