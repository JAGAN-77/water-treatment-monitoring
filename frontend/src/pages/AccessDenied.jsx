import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied = ({ requiredRole }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-error/40 rounded-xl p-8 max-w-lg w-full text-center shadow-[0_4px_25px_rgba(255,180,171,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
        
        <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-6 text-error">
          <span className="material-symbols-outlined text-3xl">gpp_bad</span>
        </div>

        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
          Access Restricted
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          You do not have administrative authorization to access this area.
        </p>

        <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/50 text-left mb-6 font-label-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Logged In User:</span>
            <span className="text-on-surface font-semibold">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Assigned Role:</span>
            <span className="text-primary font-semibold">{user?.role}</span>
          </div>
          {requiredRole && (
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Required Role:</span>
              <span className="text-error font-semibold">{requiredRole}</span>
            </div>
          )}
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-lg hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(173,198,255,0.25)]"
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          Return to My Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
