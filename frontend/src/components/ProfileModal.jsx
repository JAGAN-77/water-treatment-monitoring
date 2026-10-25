import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  const getRolePermissions = (role) => {
    switch (role) {
      case 'Admin':
        return [
          { name: 'Live Sensor Telemetry', granted: true },
          { name: 'Manage & Resolve Alerts', granted: true },
          { name: 'Configure Thresholds & Simulator', granted: true },
          { name: 'Historical Telemetry & Analytics', granted: true },
          { name: 'User Management & Role Assignment', granted: true },
          { name: 'System Settings Control', granted: true },
        ];
      case 'Plant Operator':
        return [
          { name: 'Live Sensor Telemetry', granted: true },
          { name: 'Manage & Resolve Alerts', granted: true },
          { name: 'Historical Telemetry & Analytics', granted: true },
          { name: 'Configure Thresholds & Simulator', granted: false },
          { name: 'User Management & Role Assignment', granted: false },
          { name: 'System Settings Control', granted: false },
        ];
      case 'Monitoring Analyst':
        return [
          { name: 'Live Sensor Telemetry', granted: true },
          { name: 'Historical Trends & Analytics', granted: true },
          { name: 'Export Monitoring Reports', granted: true },
          { name: 'Manage & Resolve Alerts', granted: false },
          { name: 'Configure Thresholds & Simulator', granted: false },
          { name: 'User Management & Role Assignment', granted: false },
        ];
      default:
        return [];
    }
  };

  const permissions = getRolePermissions(user.role);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-outline-variant rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        {/* Header Strip */}
        <div className="h-1.5 w-full bg-primary"></div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(77,142,255,0.3)]">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {user.name}
                </h3>
                <p className="font-label-mono text-xs text-on-surface-variant">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/50 font-label-mono text-xs">
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase block mb-1">
                Assigned Role
              </span>
              <span className="text-primary font-bold">{user.role}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase block mb-1">
                Assigned Shift
              </span>
              <span className="text-on-surface font-semibold">Shift {user.shift || 'A'}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase block mb-1">
                Account Status
              </span>
              <span className="text-[#10B981] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Active
              </span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase block mb-1">
                Last Authenticated
              </span>
              <span className="text-on-surface">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Current Session'}
              </span>
            </div>
          </div>

          {/* Role Permissions List */}
          <div className="mb-6">
            <h4 className="font-label-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-2">
              Role Permission Capabilities
            </h4>
            <div className="space-y-1.5 bg-surface-container/60 p-3 rounded-lg border border-outline-variant/30 text-xs font-label-mono">
              {permissions.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className={p.granted ? 'text-on-surface' : 'text-on-surface-variant/50'}>
                    {p.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] ${
                      p.granted ? 'text-[#10B981]' : 'text-error/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {p.granted ? 'check_circle' : 'cancel'}
                    </span>
                    {p.granted ? 'Authorized' : 'Restricted'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="flex items-center gap-2 text-error hover:bg-error/10 px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="bg-primary text-on-primary font-label-sm text-label-sm px-5 py-2 rounded-lg hover:bg-primary-fixed transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
