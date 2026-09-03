import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import AdminActionModal from '../components/AdminActionModal';
import ImageModal from '../components/ImageModal';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalAction, setModalAction] = useState('warn'); // 'warn' | 'block' | 'unblock'
  const [fullscreenImage, setFullscreenImage] = useState(null);

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

  const openActionModal = (u, action) => {
    setModalUser(u);
    setModalAction(action);
    setModalOpen(true);
  };

  const confirmAction = async (userId, payload) => {
    if (modalAction === 'warn') {
      await api.admin.warnUser(userId, payload);
    } else if (modalAction === 'block') {
      await api.admin.blockUser(userId, payload);
    } else if (modalAction === 'unblock') {
      await api.admin.unblockUser(userId, payload);
    }
    loadData();
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.roll_number || '').toLowerCase().includes(q)
    );
  });

  const activeUsers = filteredUsers.filter(u => !u.is_blocked);
  const blockedUsers = filteredUsers.filter(u => u.is_blocked);

  const renderUserTable = (userList, isBlockedTab) => (
    <div className="overflow-x-auto bg-cw-surface rounded-xl border border-cw-border">
      <table className="w-full text-left text-sm text-cw-text-2">
        <thead className="bg-cw-bg-alt text-xs uppercase text-cw-text-3">
          <tr>
            <th className="px-6 py-4 font-semibold">User</th>
            <th className="px-6 py-4 font-semibold">Roll No</th>
            <th className="px-6 py-4 font-semibold">Warnings</th>
            <th className="px-6 py-4 font-semibold">Trust Score</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cw-border">
          {userList.map(u => (
            <tr key={u.id} className="hover:bg-cw-bg-alt/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-cw-text-1">{u.full_name || 'Anonymous'}</div>
                <div className="text-xs text-cw-text-3">{u.email}</div>
              </td>
              <td className="px-6 py-4 font-mono text-xs">{u.roll_number || '-'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.warnings_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-cw-bg text-cw-text-3'}`}>
                  {u.warnings_count || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                {u.rating_average ? Number(u.rating_average).toFixed(1) : '-'} <span className="text-xs text-cw-text-3">({u.rating_count})</span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {!isBlockedTab ? (
                  <>
                    <button
                      onClick={() => openActionModal(u, 'warn')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                    >
                      Warn
                    </button>
                    <button
                      onClick={() => openActionModal(u, 'block')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      Block
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openActionModal(u, 'unblock')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                  >
                    Unblock
                  </button>
                )}
              </td>
            </tr>
          ))}
          {userList.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-cw-text-3">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="search"
          placeholder="Search by name, email, or roll no..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="field max-w-sm"
        />
      </div>
      {renderUserTable(activeUsers, false)}
    </div>
  );

  const renderBlockedTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="search"
          placeholder="Search blocked users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="field max-w-sm"
        />
      </div>
      {renderUserTable(blockedUsers, true)}
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
                <div onClick={() => setFullscreenImage(r.proof_url)}>
                  <img src={r.proof_url} alt="Proof" className="max-h-48 rounded border border-cw-border object-cover cursor-zoom-in" />
                </div>
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
                  onClick={() => openActionModal({ id: r.reported_user_id, full_name: r.reported_name, email: r.reported_email }, 'warn')}
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
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                ? 'border-cw-accent text-cw-accent'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
              }`}
          >
            Active Users ({activeUsers.length})
          </button>
          <button
            onClick={() => { setActiveTab('blocked'); setSearchQuery(''); }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'blocked'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
              }`}
          >
            Blocked Users ({blockedUsers.length})
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setSearchQuery(''); }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reports'
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
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'blocked' && renderBlockedTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>
      )}

      <AdminActionModal
        isOpen={modalOpen}
        user={modalUser}
        actionType={modalAction}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
      />

      {fullscreenImage && (
        <ImageModal src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </div>
  );
}
