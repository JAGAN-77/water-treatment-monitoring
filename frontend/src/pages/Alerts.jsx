import { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const canResolve = user?.role === 'Admin' || user?.role === 'Plant Operator';

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    socket.on('newAlert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    socket.on('alertResolved', (resolvedAlert) => {
      setAlerts(prev => prev.map(a => a._id === resolvedAlert._id ? resolvedAlert : a));
    });

    return () => {
      socket.off('newAlert');
      socket.off('alertResolved');
    };
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) return <div className="p-4 text-on-surface">Loading alerts...</div>;

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);
  const displayedAlerts = activeTab === 'ACTIVE' ? activeAlerts : resolvedAlerts;

  const getSeverityConfig = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return { color: 'error', icon: 'dangerous', bg: 'bg-error', text: 'text-error', border: 'border-error' };
      case 'WARNING':
      case 'HIGH':
        return { color: 'tertiary-container', icon: 'science', bg: 'bg-tertiary-container', text: 'text-tertiary-container', border: 'border-tertiary-container' };
      default:
        return { color: 'secondary', icon: 'info', bg: 'bg-secondary', text: 'text-on-surface-variant', border: 'border-outline-variant' };
    }
  };

  return (
    <div className="w-full">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Alerts Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Monitor and resolve system anomalies.</p>
        </div>
        <div className="flex bg-surface-container-high rounded p-1 border border-outline-variant">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-6 py-2 rounded font-label-sm text-label-sm transition-colors ${activeTab === 'ACTIVE' ? 'bg-surface-container-highest text-primary shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            Active Alerts ({activeAlerts.length})
          </button>
          <button 
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-6 py-2 rounded font-label-sm text-label-sm transition-colors ${activeTab === 'RESOLVED' ? 'bg-surface-container-highest text-primary shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            Resolved Alerts ({resolvedAlerts.length})
          </button>
        </div>
      </div>

      {displayedAlerts.length === 0 ? (
        <div className="text-on-surface-variant p-4">No {activeTab.toLowerCase()} alerts.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-stack-md">
          {displayedAlerts.map(alert => {
            const config = getSeverityConfig(alert.severity);
            const isCritical = alert.severity?.toUpperCase() === 'CRITICAL';
            
            return (
              <div key={alert._id} className={`bg-surface-container-low rounded-lg border ${config.border} ${isCritical && !alert.resolved ? 'pulse-border' : ''} p-stack-md flex flex-col relative overflow-hidden shadow-sm`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bg}`}></div>
                
                {alert.resolved && (
                  <div className="absolute top-4 right-4 bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant font-label-mono text-[10px] flex items-center gap-1 border border-outline-variant">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    RESOLVED
                  </div>
                )}

                <div className={`flex justify-between items-start mb-4 pl-2 ${alert.resolved ? 'mt-4' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded ${config.bg}/20 flex items-center justify-center border ${config.border}/30 ${config.text}`}>
                      <span className="material-symbols-outlined text-sm">{config.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-label-sm text-label-sm text-on-surface text-base">{alert.parameter} Alert</h3>
                      <p className={`font-label-mono text-label-mono ${config.text} text-xs`}>{alert.severity}</p>
                    </div>
                  </div>
                  <span className="font-label-mono text-label-mono text-on-surface-variant text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="pl-2 flex-1 mb-6">
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">{alert.message}</p>
                  <div className="grid grid-cols-2 gap-4 bg-surface-container-lowest p-3 rounded border border-outline-variant/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                    <div>
                      <p className="font-label-mono text-label-mono text-on-surface-variant text-[10px] uppercase mb-1">Current Value</p>
                      <p className={`font-headline-md text-headline-md ${config.text}`}>{alert.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-label-mono text-label-mono text-on-surface-variant text-[10px] uppercase mb-1">Threshold</p>
                      <p className="font-headline-md text-headline-md text-on-surface">{alert.threshold}</p>
                    </div>
                  </div>
                </div>
                
                {!alert.resolved && (
                  <div className="pl-2 flex gap-3 mt-auto">
                    {canResolve ? (
                      <button 
                        onClick={() => handleResolve(alert._id)}
                        className="flex-1 bg-primary text-on-primary font-label-sm text-label-sm py-2 px-4 rounded hover:bg-primary/90 transition-colors shadow-[0_0_12px_rgba(173,198,255,0.2)] flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Resolve Alert
                      </button>
                    ) : (
                      <div className="w-full bg-surface-container/60 border border-outline-variant/40 py-2 px-3 rounded text-center font-label-mono text-[11px] text-on-surface-variant flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-outline">lock</span>
                        <span>Read-only: Analyst cannot resolve alerts</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
