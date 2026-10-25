import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 1 hour');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [readingsRes, statsRes] = await Promise.all([
          api.get('/readings?limit=50'),
          api.get('/readings/stats')
        ]);
        
        const formattedData = readingsRes.data.reverse().map(d => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
        
        setData(formattedData);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const renderChart = (title, dataKey, color) => (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] p-stack-md flex flex-col h-80 mb-stack-lg">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{title} Over Time</h3>
      <div className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded shadow-inner p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold">Analytics & Trends</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Deep dive into historical performance metrics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
            {['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-4 py-1.5 font-label-sm text-label-sm rounded-md transition-colors ${timeRange === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant font-label-mono">Loading analytics...</div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md mb-stack-lg">
              <div className="bg-surface-container-low rounded-lg border border-outline-variant p-stack-md flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 ml-2">Average pH</h3>
                <div className="font-display-metrics text-display-metrics text-on-surface ml-2 mb-2">{stats.avgPh?.toFixed(2) || '--'}</div>
                <div className="font-label-mono text-label-mono text-on-surface-variant ml-2 text-xs">
                  Min: <span className="text-on-surface">{stats.minPh?.toFixed(2)}</span> | Max: <span className="text-on-surface">{stats.maxPh?.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-surface-container-low rounded-lg border border-outline-variant p-stack-md flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary-container"></div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 ml-2">Avg Temperature</h3>
                <div className="font-display-metrics text-display-metrics text-on-surface ml-2 mb-2">{stats.avgTemp?.toFixed(2) || '--'} <span className="text-lg">°C</span></div>
                <div className="font-label-mono text-label-mono text-on-surface-variant ml-2 text-xs">
                  Min: <span className="text-on-surface">{stats.minTemp?.toFixed(2)}</span> | Max: <span className="text-on-surface">{stats.maxTemp?.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-lg border border-outline-variant p-stack-md flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f59e0b]"></div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 ml-2">Avg Turbidity</h3>
                <div className="font-display-metrics text-display-metrics text-on-surface ml-2 mb-2">{stats.avgTurb?.toFixed(2) || '--'} <span className="text-lg">NTU</span></div>
                <div className="font-label-mono text-label-mono text-on-surface-variant ml-2 text-xs">
                  Min: <span className="text-on-surface">{stats.minTurb?.toFixed(2)}</span> | Max: <span className="text-on-surface">{stats.maxTurb?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md">
            {renderChart('pH Level', 'ph', '#adc6ff')}
            {renderChart('Temperature', 'temperature', '#df7412')}
            {renderChart('Turbidity', 'turbidity', '#f59e0b')}
            {renderChart('Water Level', 'waterLevel', '#10b981')}
            <div className="lg:col-span-2">
              {renderChart('Flow Rate', 'flowRate', '#8b5cf6')}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
