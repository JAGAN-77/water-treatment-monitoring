import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Plant Operator',
    shift: 'A'
  });
  const [newPassword, setNewPassword] = useState('');
  const [roleFormData, setRoleFormData] = useState({ role: '', shift: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/users', formData);
      setSuccess(`User ${res.data.user.name} created successfully.`);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'Plant Operator', shift: 'A' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      alert('You cannot deactivate your own admin account.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/users/${user._id}/status`);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.patch(`/users/${selectedUser._id}/role`, roleFormData);
      setSuccess(`Role and shift updated for ${selectedUser.name}.`);
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post(`/users/${selectedUser._id}/reset-password`, { newPassword });
      setSuccess(`Password reset successfully for ${selectedUser.name}.`);
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-primary/20 text-primary border-primary/40';
      case 'Plant Operator':
        return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40';
      case 'Monitoring Analyst':
        return 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/40';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            User & Access Management
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Create users, manage role authorizations, assign shifts, and monitor system access.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-sm text-label-sm hover:bg-primary-fixed shadow-[0_0_12px_rgba(173,198,255,0.25)] transition-all"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Add New User
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/40 flex items-center justify-between text-error font-label-sm text-label-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-75">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/40 flex items-center justify-between text-[#10B981] font-label-sm text-label-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="hover:opacity-75">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant font-label-mono text-label-mono text-on-surface-variant text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 font-body-md text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant font-label-mono">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-on-surface-variant">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface flex items-center gap-2">
                              {u.name}
                              {isCurrent && (
                                <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-label-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="font-label-mono text-xs text-on-surface-variant">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-label-mono border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-label-mono text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">
                          Shift {u.shift}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-label-mono ${
                            u.isActive
                              ? 'text-[#10B981] bg-[#10B981]/10'
                              : 'text-error bg-error/10'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-[#10B981]' : 'bg-error'
                            }`}
                          ></span>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-label-mono text-xs text-on-surface-variant">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit Role & Shift"
                            onClick={() => {
                              setSelectedUser(u);
                              setRoleFormData({ role: u.role, shift: u.shift });
                              setShowRoleModal(true);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">manage_accounts</span>
                          </button>
                          <button
                            title="Reset Password"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword('');
                              setShowPasswordModal(true);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-tertiary-container hover:bg-surface-container rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">key</span>
                          </button>
                          <button
                            title={u.isActive ? 'Deactivate User' : 'Activate User'}
                            disabled={isCurrent}
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded transition-colors ${
                              isCurrent
                                ? 'text-outline-variant/40 cursor-not-allowed'
                                : u.isActive
                                ? 'text-error/80 hover:text-error hover:bg-error/10'
                                : 'text-[#10B981]/80 hover:text-[#10B981] hover:bg-[#10B981]/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {u.isActive ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-outline-variant rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
              Add New User Account
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                />
              </div>
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@watertreatment.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                />
              </div>
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Plant Operator">Plant Operator</option>
                    <option value="Monitoring Analyst">Monitoring Analyst</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                  >
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                    <option value="C">Shift C</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm text-label-sm hover:bg-primary-fixed"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Role & Shift */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-outline-variant rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              Update Role & Shift
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-4">
              Editing permissions for <span className="text-on-surface font-semibold">{selectedUser.name}</span>
            </p>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  Role
                </label>
                <select
                  value={roleFormData.role}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                >
                  <option value="Admin">Admin</option>
                  <option value="Plant Operator">Plant Operator</option>
                  <option value="Monitoring Analyst">Monitoring Analyst</option>
                </select>
              </div>
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  Assigned Shift
                </label>
                <select
                  value={roleFormData.shift}
                  onChange={(e) => setRoleFormData({ ...roleFormData, shift: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                >
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                  <option value="C">Shift C</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm text-label-sm hover:bg-primary-fixed"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-outline-variant rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              Reset Password
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-4">
              Enter a new password for <span className="text-on-surface font-semibold">{selectedUser.name}</span>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block font-label-mono text-xs text-on-surface-variant uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface text-sm font-label-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm text-label-sm hover:bg-primary-fixed"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
