import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canResolve = user?.role === 'Admin' || user?.role === 'Plant Operator';

  const fetchActiveAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts/active');
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Error fetching active alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveAlerts();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNewAlert = (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev.filter((a) => a._id !== newAlert._id)]);
    };

    const handleResolved = (resolved) => {
      setAlerts((prev) => prev.filter((a) => a._id !== resolved._id));
    };

    socket.on('newAlert', handleNewAlert);
    socket.on('alertResolved', handleResolved);

    return () => {
      socket.off('newAlert', handleNewAlert);
      socket.off('alertResolved', handleResolved);
    };
  }, []);

  const handleResolveAlert = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/alerts/${id}/resolve`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-[#1E293B] border border-outline-variant rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          <h3 className="font-headline-sm text-sm font-bold text-on-surface">
            Active Alerts ({alerts.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/30 p-2">
        {loading ? (
          <div className="p-6 text-center text-on-surface-variant font-label-mono text-xs">
            Polling alert telemetry...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl text-[#10B981] mb-2 block">
              verified
            </span>
            <p className="font-label-sm text-xs text-on-surface">All circuits nominal</p>
            <p className="font-label-mono text-[11px] text-on-surface-variant mt-0.5">
              No active warnings or critical threshold alarms.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity?.toUpperCase() === 'CRITICAL';
            return (
              <div
                key={alert._id}
                className="p-3 hover:bg-surface-container/50 transition-colors rounded-lg flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-error animate-ping' : 'bg-tertiary-container'
                      }`}
                    ></span>
                    <span className="font-label-sm text-xs font-semibold text-on-surface">
                      {alert.parameter}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-label-mono uppercase ${
                        isCritical
                          ? 'bg-error/20 text-error border border-error/40'
                          : 'bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <span className="font-label-mono text-[10px] text-on-surface-variant">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>

                <p className="font-body-md text-xs text-on-surface-variant line-clamp-2">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between text-[11px] font-label-mono mt-1">
                  <span className="text-on-surface-variant">
                    Value: <span className="text-on-surface font-bold">{alert.value?.toFixed?.(2) ?? alert.value}</span> (Thresh: {alert.threshold})
                  </span>

                  {canResolve ? (
                    <button
                      onClick={(e) => handleResolveAlert(alert._id, e)}
                      className="bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-2.5 py-1 rounded text-[11px] transition-colors"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-on-surface-variant/60 text-[10px]">
                      Read-only
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/60 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/alerts');
          }}
          className="text-primary hover:underline font-label-sm text-xs inline-flex items-center gap-1"
        >
          <span>Open Full Alerts Management</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
