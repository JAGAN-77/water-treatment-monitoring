import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ShiftPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const currentHour = now.getHours();

  // Determine active plant shift based on hour
  let activeShift = 'C';
  let shiftStartHour = 22;
  let shiftEndHour = 6;
  let shiftHours = '22:00 - 06:00';

  if (currentHour >= 6 && currentHour < 14) {
    activeShift = 'A';
    shiftStartHour = 6;
    shiftEndHour = 14;
    shiftHours = '06:00 - 14:00';
  } else if (currentHour >= 14 && currentHour < 22) {
    activeShift = 'B';
    shiftStartHour = 14;
    shiftEndHour = 22;
    shiftHours = '14:00 - 22:00';
  }

  // Calculate percentage of shift completed
  let elapsedMinutes = 0;
  if (activeShift === 'A') {
    elapsedMinutes = (currentHour - 6) * 60 + now.getMinutes();
  } else if (activeShift === 'B') {
    elapsedMinutes = (currentHour - 14) * 60 + now.getMinutes();
  } else {
    elapsedMinutes = ((currentHour >= 22 ? currentHour - 22 : currentHour + 2) * 60) + now.getMinutes();
  }
  const shiftProgressPercent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / 480) * 100)));

  const isUserOnDuty = user?.shift === activeShift;

  return (
    <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-[#1E293B] border border-outline-variant rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">schedule</span>
          <h3 className="font-headline-sm text-sm font-bold text-on-surface">
            Plant Shift & System Clock
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div className="p-4 space-y-4 font-label-mono text-xs">
        {/* Real-time clocks */}
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase block">Plant Local Time</span>
            <span className="text-base font-bold text-on-surface">
              {now.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant uppercase block">UTC Timestamp</span>
            <span className="text-sm font-bold text-primary">
              {now.toISOString().substring(11, 19)} UTC
            </span>
          </div>
        </div>

        {/* Current Active Plant Shift */}
        <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant text-[11px] uppercase">Active Operating Shift</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
              Shift {activeShift} ({shiftHours})
            </span>
          </div>

          <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden border border-outline-variant/30 mb-1.5">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${shiftProgressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant">
            <span>Progress: {shiftProgressPercent}%</span>
            <span>Handover: {shiftHours.split(' - ')[1]}</span>
          </div>
        </div>

        {/* User Duty Status */}
        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase block">Your Assigned Shift</span>
              <span className="text-sm font-bold text-on-surface">
                Shift {user?.shift || 'A'}
              </span>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold ${
                  isUserOnDuty
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isUserOnDuty ? 'bg-[#10B981] animate-pulse' : 'bg-outline'
                  }`}
                ></span>
                {isUserOnDuty ? 'ACTIVE ON DUTY' : 'STANDBY / OFF-SHIFT'}
              </span>
            </div>
          </div>
        </div>

        {/* Shifts Schedule Reference */}
        <div className="border-t border-outline-variant/40 pt-3">
          <span className="text-[10px] text-on-surface-variant uppercase block mb-1.5">
            Rotational Shift Roster
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className={`p-1.5 rounded border text-center ${activeShift === 'A' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
              <div className="font-bold">Shift A</div>
              <div>06:00 - 14:00</div>
            </div>
            <div className={`p-1.5 rounded border text-center ${activeShift === 'B' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
              <div className="font-bold">Shift B</div>
              <div>14:00 - 22:00</div>
            </div>
            <div className={`p-1.5 rounded border text-center ${activeShift === 'C' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
              <div className="font-bold">Shift C</div>
              <div>22:00 - 06:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftPanel;
