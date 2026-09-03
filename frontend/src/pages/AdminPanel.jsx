import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, reportsData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getReports(),
      ]);
      setUsers(usersData.users);
      setReports(reportsData.reports);
    } catch (err) {
      if (err.status === 403) {
        navigate('/');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWarn = async (id, name) => {
    if (!window.confirm(`Are you sure you want to warn ${name}?`)) return;
    try {
      await api.admin.warnUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY remove ${name}? This cannot be undone.`)) return;
    try {
      await api.admin.removeUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const renderUsersTab = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-cw-text-2">
        <thead className="bg-cw-bg-alt text-xs uppercase text-cw-text-3">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Warnings</th>
            <th className="px-6 py-3">Trust Score</th>
            <th className="px-6 py-3">Joined</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-cw-border bg-cw-surface hover:bg-cw-bg-alt/50">
              <td className="px-6 py-4 font-medium text-cw-text-1">{u.full_name || 'Anonymous'}</td>
              <td className="px-6 py-4">{u.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.warnings_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-cw-bg text-cw-text-3'}`}>
                  {u.warnings_count || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                {u.rating_average ? Number(u.rating_average).toFixed(1) : '-'} ({u.rating_count})
              </td>
              <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right space-x-3">
                <button 
                  onClick={() => handleWarn(u.id, u.full_name || u.email)}
                  className="text-amber-500 hover:text-amber-600 font-medium"
                >
                  Warn
                </button>
                <button 
                  onClick={() => handleRemove(u.id, u.full_name || u.email)}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="p-8 text-center text-cw-text-2 bg-cw-surface rounded-xl border border-cw-border">
          No reports submitted yet.
        </div>
      ) : (
        reports.map(r => (
          <div key={r.id} className="card p-6 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded">
                  {r.reason.replace('_', ' ')}
                </span>
                <p className="mt-3 text-sm text-cw-text-1 whitespace-pre-line">{r.description}</p>
              </div>
              <span className="text-xs text-cw-text-3">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            
            {r.proof_url && (
              <div className="mt-4">
                <p className="text-xs font-medium text-cw-text-3 mb-2">Attached Proof:</p>
                <a href={r.proof_url} target="_blank" rel="noreferrer">
                  <img src={r.proof_url} alt="Proof" className="max-h-48 rounded border border-cw-border object-cover cursor-zoom-in" />
                </a>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-cw-border flex justify-between items-center text-sm">
              <div className="text-cw-text-2">
                Reported <span className="font-semibold text-cw-text-1">{r.reported_name || r.reported_email}</span> 
                {' by '} 
                <span className="font-semibold text-cw-text-1">{r.reporter_name || r.reporter_email}</span>
              </div>
              <div className="space-x-3">
                <button 
                  onClick={() => handleWarn(r.reported_user_id, r.reported_name || r.reported_email)}
                  className="btn-ghost py-1 px-3 text-xs"
                >
                  Warn User
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cw-text-1">Admin Panel</h1>
          <p className="text-sm text-cw-text-3">SkillBridge System Administration</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="border-b border-cw-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-cw-accent text-cw-accent'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-cw-accent text-cw-accent'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
            }`}
          >
            Reports ({reports.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="py-12 text-center text-cw-text-3">Loading admin data...</div>
      ) : (
        <div className="mt-6">
          {activeTab === 'users' ? renderUsersTab() : renderReportsTab()}
        </div>
      )}
    </div>
  );
}
