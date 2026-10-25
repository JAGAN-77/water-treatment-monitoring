import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import SensorCard from '../components/SensorCard';
import { exportReadingsToCsv } from '../utils/exportCsv';

const Dashboard = ({ plantStatus }) => {
  const { user } = useAuth();
  const [latestData, setLatestData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readingsRes, settingsRes, alertsRes, statsRes, historyRes] = await Promise.all([
          api.get('/readings/latest'),
          api.get('/settings'),
          api.get('/alerts/active'),
          api.get('/readings/stats').catch(() => ({ data: null })),
          api.get('/readings?limit=25').catch(() => ({ data: [] }))
        ]);
        setLatestData(readingsRes.data);
        setSettings(settingsRes.data);
        setActiveAlerts(alertsRes.data || []);
        setStats(statsRes.data);
        setRecentReadings(historyRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleSensorUpdate = (data) => {
      setLatestData(data);
    };

    const handleNewAlert = (alert) => {
      setActiveAlerts(prev => [alert, ...prev]);
    };

    const handleAlertResolved = (resolved) => {
      setActiveAlerts(prev => prev.filter(a => a._id !== resolved._id));
    };

    socket.on('sensorUpdate', handleSensorUpdate);
    socket.on('newAlert', handleNewAlert);
    socket.on('alertResolved', handleAlertResolved);

    return () => {
      socket.off('sensorUpdate', handleSensorUpdate);
      socket.off('newAlert', handleNewAlert);
      socket.off('alertResolved', handleAlertResolved);
    };
  }, []);

  const handleResolveAlert = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      setActiveAlerts(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error('Error resolving alert from dashboard:', error);
    }
  };

  if (loading) return <div className="p-4 text-on-surface">Loading telemetry dashboard...</div>;
  if (!settings) return <div className="p-4 text-error">Error loading configuration.</div>;

  const isAbnormal = (param) => latestData?.abnormalParameters?.includes(param);
  const getStatus = (param) => isAbnormal(param) ? 'WARNING' : 'NORMAL';

  const role = user?.role || 'Plant Operator';
  const isAdmin = role === 'Admin';
  const isOperator = role === 'Plant Operator';
  const isAnalyst = role === 'Monitoring Analyst';

  return (
    <div className="w-full space-y-stack-lg">
      {/* Role-Specific Dashboard Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 p-5 bg-[#1E293B] border border-outline-variant/60 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] relative overflow-hidden">
        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isAdmin ? 'bg-primary' : isOperator ? 'bg-[#10B981]' : 'bg-tertiary-container'}`}></div>
        
        <div className="pl-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase font-label-mono px-2 py-0.5 rounded font-bold ${
              isAdmin ? 'bg-primary/20 text-primary border border-primary/40' :
              isOperator ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' :
              'bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/40'
            }`}>
              {isAdmin ? 'Admin Dashboard' : isOperator ? 'Operator Dashboard' : 'Analyst Dashboard'}
            </span>
            <span className="text-on-surface-variant font-label-mono text-xs">
              • Shift {user?.shift || 'A'}
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {isAdmin && 'System Overview & Administrative Command'}
            {isOperator && 'Plant Operations & Active Telemetry'}
            {isAnalyst && 'Water Quality Telemetry & Trend Analysis'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            {isAdmin && 'Full administrative authority: telemetry, threshold parameters, simulator tuning, and user permissions.'}
            {isOperator && 'Active line telemetry monitoring, abnormal threshold response, and operational alert acknowledge.'}
            {isAnalyst && 'Historical quality metrics, variance reports, telemetry analysis, and statistical reporting.'}
          </p>
        </div>

        {/* Status badges & actions */}
        <div className="flex flex-wrap items-center gap-3 pl-2 lg:pl-0">
          <div className="bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${plantStatus === 'ALERT' ? 'bg-error animate-pulse' : 'bg-primary'}`}></div>
            <span className="font-label-mono text-label-mono text-on-surface text-xs">
              System Status: <span className={plantStatus === 'ALERT' ? 'text-error font-bold' : 'text-primary font-bold'}>{plantStatus}</span>
            </span>
          </div>

          {isAnalyst && (
            <button
              onClick={() => exportReadingsToCsv(recentReadings)}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-sm text-xs hover:bg-primary-fixed transition-colors shadow-[0_0_12px_rgba(173,198,255,0.2)]"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export Report (CSV)
            </button>
          )}

          {isAdmin && (
            <Link
              to="/settings"
              className="flex items-center gap-2 bg-surface-container border border-outline-variant px-3.5 py-2 rounded-lg font-label-sm text-xs text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-primary">tune</span>
              Thresholds & Sim
            </Link>
          )}
        </div>
      </div>

      {/* Sensor Cards Grid (5 Up) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider font-label-mono">
            Live Parameter Telemetry
          </h3>
          <span className="font-label-mono text-[11px] text-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            Real-time Sensor Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-stack-md">
          <SensorCard 
            label="pH Level" 
            value={latestData?.ph} 
            unit="pH" 
            status={getStatus('pH')}
          />
          <SensorCard 
            label="Temperature" 
            value={latestData?.temperature} 
            unit="°C" 
            status={getStatus('Temperature')}
          />
          <SensorCard 
            label="Turbidity" 
            value={latestData?.turbidity} 
            unit="NTU" 
            status={getStatus('Turbidity')}
          />
          <SensorCard 
            label="Water Level" 
            value={latestData?.waterLevel} 
            unit="%" 
            isInfo={true}
          />
          <SensorCard 
            label="Flow Rate" 
            value={latestData?.flowRate} 
            unit="L/min" 
            status={getStatus('Flow Rate')}
          />
        </div>
      </div>

      {/* Role-Specific Secondary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md">
        {/* Active Alarms & Alerts Queue (2 Columns) */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-[#334155] rounded-xl p-stack-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">warning</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                Active System Alarms ({activeAlerts.length})
              </h3>
            </div>
            <Link
              to="/alerts"
              className="text-primary hover:underline font-label-mono text-xs flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {activeAlerts.length === 0 ? (
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/40 text-center">
                <span className="material-symbols-outlined text-3xl text-[#10B981] mb-1">
                  check_circle
                </span>
                <p className="font-label-sm text-sm text-on-surface">No Unresolved Anomalies</p>
                <p className="font-label-mono text-xs text-on-surface-variant mt-0.5">
                  All filtration and secondary disinfection circuits operating within configured limits.
                </p>
              </div>
            ) : (
              activeAlerts.slice(0, 4).map((alert) => {
                const isCritical = alert.severity?.toUpperCase() === 'CRITICAL';
                return (
                  <div
                    key={alert._id}
                    className="p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        isCritical ? 'bg-error/20 text-error' : 'bg-tertiary-container/20 text-tertiary-container'
                      }`}>
                        <span className="material-symbols-outlined text-base">
                          {isCritical ? 'dangerous' : 'warning'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-xs text-on-surface font-semibold truncate">
                            {alert.parameter} Anomaly
                          </span>
                          <span className={`text-[10px] font-label-mono px-1.5 py-0.2 rounded uppercase ${
                            isCritical ? 'bg-error/20 text-error' : 'bg-tertiary-container/20 text-tertiary-container'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="font-label-mono text-[11px] text-on-surface-variant truncate">
                          Current: {alert.value?.toFixed?.(2) ?? alert.value} | Threshold: {alert.threshold}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div>
                      {isAnalyst ? (
                        <span className="text-[10px] font-label-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                          Read-only
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolveAlert(alert._id)}
                          className="bg-primary/20 hover:bg-primary text-primary hover:text-on-primary font-label-sm text-xs px-3 py-1.5 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Role-Specific Widget (1 Column) */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-stack-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] flex flex-col justify-between">
          {/* Admin Role Widget */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  Admin Control Center
                </h3>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 space-y-2 font-label-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Simulator Probability:</span>
                  <span className="text-primary font-bold">{settings?.abnormalProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">pH Normal Range:</span>
                  <span className="text-on-surface">{settings?.ph?.min} - {settings?.ph?.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Turbidity Range:</span>
                  <span className="text-on-surface">{settings?.turbidity?.min} - {settings?.turbidity?.max} NTU</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-label-sm text-xs">
                <Link
                  to="/users"
                  className="w-full flex items-center justify-between p-2.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface transition-colors border border-outline-variant/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">manage_accounts</span>
                    <span>Manage User Accounts</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  to="/settings"
                  className="w-full flex items-center justify-between p-2.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface transition-colors border border-outline-variant/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">tune</span>
                    <span>Configure Sensor Thresholds</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {/* Plant Operator Role Widget */}
          {isOperator && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#10B981]">
                <span className="material-symbols-outlined">badge</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  Shift Operations Station
                </h3>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 space-y-2 font-label-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Operator On Duty:</span>
                  <span className="text-on-surface font-bold">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active Shift:</span>
                  <span className="text-[#10B981] font-bold">Shift {user?.shift || 'A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active Alarms Count:</span>
                  <span className={activeAlerts.length > 0 ? 'text-error font-bold' : 'text-[#10B981]'}>
                    {activeAlerts.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-label-sm text-xs">
                <Link
                  to="/live"
                  className="w-full flex items-center justify-between p-2.5 bg-primary text-on-primary rounded-lg transition-colors shadow-[0_0_12px_rgba(173,198,255,0.2)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">sensors</span>
                    <span>Open Live Circuit Stream</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  to="/alerts"
                  className="w-full flex items-center justify-between p-2.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface transition-colors border border-outline-variant/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-tertiary-container">notification_important</span>
                    <span>Manage Active Alarms</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {/* Monitoring Analyst Role Widget */}
          {isAnalyst && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-tertiary-container">
                <span className="material-symbols-outlined">monitoring</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  Statistical Quality Summary
                </h3>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 space-y-2 font-label-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Avg pH:</span>
                  <span className="text-on-surface font-bold">
                    {stats?.avgPh ? stats.avgPh.toFixed(2) : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Avg Temp:</span>
                  <span className="text-on-surface font-bold">
                    {stats?.avgTemp ? `${stats.avgTemp.toFixed(1)} °C` : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Avg Turbidity:</span>
                  <span className="text-on-surface font-bold">
                    {stats?.avgTurb ? `${stats.avgTurb.toFixed(2)} NTU` : '--'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-label-sm text-xs">
                <button
                  onClick={() => exportReadingsToCsv(recentReadings)}
                  className="w-full flex items-center justify-between p-2.5 bg-primary text-on-primary rounded-lg transition-colors shadow-[0_0_12px_rgba(173,198,255,0.2)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Download Monitoring Report (CSV)</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">file_download</span>
                </button>
                <Link
                  to="/analytics"
                  className="w-full flex items-center justify-between p-2.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface transition-colors border border-outline-variant/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-tertiary-container">analytics</span>
                    <span>Deep Analytical Charts</span>
                  </span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
