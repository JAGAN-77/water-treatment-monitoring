import { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (param, field, value) => {
    if (param === 'abnormalProbability') {
      setSettings({ ...settings, abnormalProbability: Number(value) });
    } else {
      setSettings({
        ...settings,
        [param]: { ...settings[param], [field]: Number(value) }
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant font-label-mono">Loading settings...</div>;

  const renderInputGroup = (param, label, unit) => (
    <div className="bg-surface-container-low rounded-lg border border-outline-variant p-stack-md flex flex-col relative overflow-hidden shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
      <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-4 ml-2">{label} {unit && <span className="lowercase normal-case font-label-mono text-xs">({unit})</span>}</h3>
      <div className="flex gap-4 ml-2">
        <div className="flex-1">
          <label className="block font-label-mono text-label-mono text-on-surface-variant text-[10px] uppercase mb-1">Minimum</label>
          <input 
            type="number" 
            step="0.1" 
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded px-3 py-2 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" 
            value={settings[param].min} 
            onChange={(e) => handleChange(param, 'min', e.target.value)} 
            required 
          />
        </div>
        <div className="flex-1">
          <label className="block font-label-mono text-label-mono text-on-surface-variant text-[10px] uppercase mb-1">Maximum</label>
          <input 
            type="number" 
            step="0.1" 
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded px-3 py-2 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" 
            value={settings[param].max} 
            onChange={(e) => handleChange(param, 'max', e.target.value)} 
            required 
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg font-bold">System Settings & Thresholds</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Configure the normal operating ranges for all sensor parameters.</p>
      </div>
      
      {message && (
        <div className={`mb-stack-lg p-4 rounded-lg border flex items-center gap-3 ${message.includes('successfully') ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-error/10 border-error/30 text-error'}`}>
          <span className="material-symbols-outlined">{message.includes('successfully') ? 'check_circle' : 'error'}</span>
          <span className="font-label-sm text-label-sm">{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="p-stack-lg grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {renderInputGroup('ph', 'pH Level', 'pH')}
          {renderInputGroup('temperature', 'Temperature', '°C')}
          {renderInputGroup('turbidity', 'Turbidity', 'NTU')}
          {renderInputGroup('waterLevel', 'Water Level', '%')}
          {renderInputGroup('flowRate', 'Flow Rate', 'L/min')}

          <div className="bg-surface-container-low rounded-lg border border-outline-variant p-stack-md flex flex-col relative overflow-hidden shadow-sm">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary-container"></div>
             <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-4 ml-2">Simulation Settings</h3>
             <div className="ml-2 flex-1 flex flex-col justify-center">
                <label className="block font-label-mono text-label-mono text-on-surface-variant text-[10px] uppercase mb-1">Abnormal Reading Probability (%)</label>
                <input 
                  type="number" 
                  step="1" 
                  min="0" 
                  max="100" 
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded px-3 py-2 text-on-surface font-label-mono text-sm focus:outline-none focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-container shadow-inner mb-2" 
                  value={settings.abnormalProbability} 
                  onChange={(e) => handleChange('abnormalProbability', null, e.target.value)} 
                  required 
                />
                <p className="font-label-mono text-[10px] text-tertiary-container">Chance of a simulated reading triggering an alert (0-100).</p>
             </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest px-stack-lg py-4 border-t border-outline-variant flex justify-end">
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-sm text-label-sm shadow-[0_0_12px_rgba(173,198,255,0.2)] hover:bg-primary-fixed transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
            disabled={saving}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
