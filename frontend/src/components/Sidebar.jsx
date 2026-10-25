import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Define navigation items with role restrictions
  const allLinks = [
    { name: 'Dashboard', path: '/', icon: 'dashboard', roles: ['Admin', 'Plant Operator', 'Monitoring Analyst'] },
    { name: 'Live Monitoring', path: '/live', icon: 'sensors', roles: ['Admin', 'Plant Operator', 'Monitoring Analyst'] },
    { name: 'Alerts', path: '/alerts', icon: 'warning', roles: ['Admin', 'Plant Operator', 'Monitoring Analyst'] },
    { name: 'History', path: '/history', icon: 'history', roles: ['Admin', 'Plant Operator', 'Monitoring Analyst'] },
    { name: 'Analytics', path: '/analytics', icon: 'monitoring', roles: ['Admin', 'Plant Operator', 'Monitoring Analyst'] },
    { name: 'Settings', path: '/settings', icon: 'settings', roles: ['Admin'] },
    { name: 'User Management', path: '/users', icon: 'manage_accounts', roles: ['Admin'] },
  ];

  // Filter links for current role
  const allowedLinks = allLinks.filter(link => {
    if (!user) return true;
    return link.roles.includes(user.role);
  });

  return (
    <>
      <nav className="fixed h-full w-[260px] left-0 top-0 bg-surface-container border-r border-outline-variant shadow-sm z-50 flex flex-col">
        <div className="flex flex-col h-full py-6">
          {/* Header/Brand */}
          <div className="px-6 mb-6">
            <h1 className="font-headline-md text-headline-md font-bold text-primary">H2O Control</h1>
            <div className="flex items-center justify-between mt-1">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Plant 042 - Active</p>
              {user && (
                <span className="font-label-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/60 text-primary">
                  {user.role === 'Plant Operator' ? 'Operator' : user.role === 'Monitoring Analyst' ? 'Analyst' : 'Admin'}
                </span>
              )}
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
            {allowedLinks.map(link => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 active:scale-95 transition-transform duration-150 border-l-4 ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined" data-icon={link.icon}>{link.icon}</span>
                  <span className="font-label-sm text-label-sm">{link.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Footer User/Shift Card (Recreated from Screenshot 1 with real user data) */}
          <div className="px-6 mt-auto pt-4 border-t border-outline-variant/30">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 p-3 bg-surface rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/40 group"
              title="Click to view operator profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-sm text-label-sm text-on-surface truncate">
                  {user?.name || 'Operator 1'}
                </p>
                <p className="font-label-mono text-label-mono text-[10px] text-on-surface-variant">
                  Shift: {user?.shift || 'A'}
                </p>
              </div>
              <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                info
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Sidebar;
