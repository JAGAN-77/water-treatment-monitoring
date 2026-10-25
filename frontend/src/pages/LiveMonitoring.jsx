import { useState, useEffect } from 'react';
import socket from '../services/socket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SensorCard from '../components/SensorCard';

const LiveMonitoring = () => {
  const [dataStream, setDataStream] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [sysTime, setSysTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('sensorUpdate', (data) => {
      setDataStream(prev => {
        const newData = [...prev, { ...data, time: new Date(data.timestamp).toLocaleTimeString() }];
        if (newData.length > 20) newData.shift(); // Keep last 20 points
        return newData;
      });
    });

    const timeInterval = setInterval(() => {
      setSysTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensorUpdate');
      clearInterval(timeInterval);
    };
  }, []);

  if (dataStream.length === 0) return <div className="p-4 text-on-surface">Waiting for live data...</div>;

  const current = dataStream[dataStream.length - 1];
  const prev = dataStream.length > 1 ? dataStream[dataStream.length - 2] : current;

  const isAbnormal = (param) => current?.abnormalParameters?.includes(param);
  const getStatus = (param) => isAbnormal(param) ? 'WARNING' : 'NORMAL';

  return (
    <div className="w-full">
      <header className="mb-stack-lg flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Live Monitoring Area</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time telemetry from primary filtration circuits.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-label-mono text-label-mono text-on-surface-variant flex gap-4">
            <span>{sysTime}</span>
            <span>UPDATES: LIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant shadow-inner">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] ${isConnected ? 'bg-[#10B981]' : 'bg-error'}`}></div>
            <span className={`font-label-mono text-label-mono text-[12px] ${isConnected ? 'text-on-surface-variant' : 'text-error'}`}>
              {isConnected ? '● LIVE' : '● CONNECTION LOST'}
            </span>
          </div>
        </div>
      </header>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-stack-md mb-stack-lg">
        <SensorCard label="pH Level" value={current?.ph?.toFixed(2)} unit="pH" status={getStatus('pH')} />
        <SensorCard label="Temperature" value={current?.temperature?.toFixed(2)} unit="°C" status={getStatus('Temperature')} />
        <SensorCard label="Turbidity" value={current?.turbidity?.toFixed(2)} unit="NTU" status={getStatus('Turbidity')} />
        <SensorCard label="Water Level" value={current?.waterLevel?.toFixed(2)} unit="%" isInfo={true} />
        <SensorCard label="Flow Rate" value={current?.flowRate?.toFixed(2)} unit="L/min" status={getStatus('Flow Rate')} />
      </div>

      {/* Large Live Data Stream Chart Area */}
      <div className="bg-[#1E293B] border border-[#334155] rounded shadow-[0_1px_4px_rgba(0,0,0,0.15)] p-stack-md relative h-96 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Main Circuit Telemetry</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary text-on-primary rounded font-label-mono text-label-mono shadow-[0_0_12px_rgba(173,198,255,0.4)] transition-colors">LIVE</button>
          </div>
        </div>
        
        {/* Chart Canvas Area using Recharts */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded shadow-inner relative overflow-hidden flex items-end w-full">
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataStream} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#df7412" tick={{ fill: '#df7412', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }} />
              
              <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#adc6ff" strokeWidth={2} dot={false} isAnimationActive={false} name="pH" />
              <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#df7412" strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="4 4" name="Turbidity" />
            </LineChart>
          </ResponsiveContainer>

          {/* Live Indicator overlay */}
          <div className="absolute right-4 top-4 flex items-center gap-2 bg-[#1E293B] border border-[#334155] px-2 py-1 rounded shadow-lg">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-primary' : 'bg-error'}`}></div>
            <span className={`font-label-mono text-label-mono text-[10px] ${isConnected ? 'text-primary' : 'text-error'}`}>
              {isConnected ? 'SYNCING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
