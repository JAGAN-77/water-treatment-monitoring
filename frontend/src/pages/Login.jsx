import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Plant Operator');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !role) {
      setError('Please provide email, password, and select your role.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password, role });
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient industrial telemetry effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#1E293B] border border-outline-variant rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-container to-tertiary-container"></div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 text-primary mb-4 shadow-[0_0_20px_rgba(173,198,255,0.2)]">
              <span className="material-symbols-outlined text-3xl">water_drop</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              Water Treatment Plant
            </h1>
            <p className="font-label-mono text-label-mono text-primary text-xs mt-1 tracking-wider uppercase">
              Monitoring System • SCADA Portal
            </p>
          </div>

          {/* Quick Demo Role Selector Pills */}
          <div className="mb-6 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/60">
            <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Role Pre-fills</span>
              <span className="text-primary font-normal">Click to load</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@watertreatment.com', 'Admin@123', 'Admin')}
                className={`py-1.5 px-2 rounded text-[11px] font-label-mono transition-colors text-center truncate ${
                  role === 'Admin' && email === 'admin@watertreatment.com'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                title="Admin: admin@watertreatment.com"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('operator@watertreatment.com', 'Operator@123', 'Plant Operator')}
                className={`py-1.5 px-2 rounded text-[11px] font-label-mono transition-colors text-center truncate ${
                  role === 'Plant Operator' && email === 'operator@watertreatment.com'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                title="Operator: operator@watertreatment.com"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('analyst@watertreatment.com', 'Analyst@123', 'Monitoring Analyst')}
                className={`py-1.5 px-2 rounded text-[11px] font-label-mono transition-colors text-center truncate ${
                  role === 'Monitoring Analyst' && email === 'analyst@watertreatment.com'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                title="Analyst: analyst@watertreatment.com"
              >
                Analyst
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/40 flex items-start gap-3 text-error">
              <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
              <div className="font-label-sm text-label-sm text-xs leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block font-label-mono text-label-mono text-[11px] text-on-surface-variant uppercase mb-1.5">
                Authorized Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@watertreatment.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner placeholder-on-surface-variant/40"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="block font-label-mono text-label-mono text-[11px] text-on-surface-variant uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter system password"
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2.5 pl-10 pr-11 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner placeholder-on-surface-variant/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Role Selection Dropdown */}
            <div>
              <label className="block font-label-mono text-label-mono text-[11px] text-on-surface-variant uppercase mb-1.5">
                Assigned Role Selection
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  badge
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg py-2.5 pl-10 pr-10 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner appearance-none cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Plant Operator">Plant Operator</option>
                  <option value="Monitoring Analyst">Monitoring Analyst</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
              <p className="font-label-mono text-[10px] text-on-surface-variant/70 mt-1">
                Note: Backend strictly validates that selected role matches your account permissions.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed shadow-[0_0_20px_rgba(173,198,255,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Credentials & Permissions...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    <span>Authenticate & Access Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-8 py-3 bg-surface-container-lowest border-t border-outline-variant/40 flex items-center justify-between text-on-surface-variant text-[11px] font-label-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            SCADA Node Active
          </span>
          <span>v2.4.0 • Plant 042</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
