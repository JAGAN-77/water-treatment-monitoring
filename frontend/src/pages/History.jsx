import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { exportReadingsToCsv } from '../utils/exportCsv';

const History = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Ensure we hit the API with some form of limits for the prototype
      const res = await api.get('/readings?limit=50');
      setReadings(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold">Historical Data Log</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review and export sensor readings and system events.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
            {['Today', '7 Days', '30 Days'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 font-label-sm text-label-sm rounded-md transition-colors ${filter === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {t}
              </button>
            ))}
            <button className="px-4 py-1.5 font-label-sm text-label-sm rounded-md text-on-surface-variant hover:text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span> Custom
            </button>
          </div>
          <button className="flex items-center gap-2 bg-surface-container border border-outline-variant px-4 py-2 rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
          </button>
          <button 
            onClick={() => exportReadingsToCsv(readings)}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-sm text-label-sm shadow-[0_0_12px_rgba(173,198,255,0.2)] hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant font-label-mono">Loading data...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">pH Level</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Temp (°C)</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Turbidity (NTU)</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tank Level (%)</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Flow (L/min)</th>
                    <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {readings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-on-surface-variant font-label-mono">No readings found for {filter}.</td>
                    </tr>
                  ) : (
                    readings.map((reading) => {
                      const getStatusText = (status) => {
                         if (status === 'ALERT') return 'WARNING';
                         return 'NORMAL';
                      };
                      
                      return (
                        <tr key={reading._id} className="hover:bg-surface-container-low transition-colors duration-150">
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface whitespace-nowrap">
                            {new Date(reading.timestamp).toLocaleString('en-US', { hour12: false }).replace(',', '')}
                          </td>
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface">{reading.ph?.toFixed(2)}</td>
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface">{reading.temperature?.toFixed(2)}</td>
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface">{reading.turbidity?.toFixed(2)}</td>
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface">{reading.waterLevel?.toFixed(2)}</td>
                          <td className="py-3 px-6 font-label-mono text-label-mono text-on-surface">{reading.flowRate?.toFixed(2)}</td>
                          <td className="py-3 px-6">
                            <StatusBadge status={getStatusText(reading.status)} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {readings.length > 0 && (
              <div className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant flex items-center justify-between">
                <div className="font-label-sm text-label-sm text-on-surface-variant">
                  Showing <span className="text-on-surface">1</span> to <span className="text-on-surface">{readings.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-on-primary font-label-sm text-label-sm">1</button>
                  </div>
                  <button className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
