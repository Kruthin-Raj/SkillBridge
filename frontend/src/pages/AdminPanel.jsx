import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import AdminActionModal from '../components/AdminActionModal';
import ImageModal from '../components/ImageModal';

/**
 * React page component for AdminPanel view.
 * @author = kruthinraj
 * @date = 2026-09-03
 */

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newCollege, setNewCollege] = useState({ domain: '', name: '' });

  // Support chat state
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [supportReply, setSupportReply] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState('all');
  const [sendingSupportReply, setSendingSupportReply] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalAction, setModalAction] = useState('warn'); // 'warn' | 'block' | 'unblock'
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, reportsData, collegesData, supportData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getReports(),
        api.admin.getColleges(),
        api.support.getAllTickets().catch(() => ({ tickets: [] })),
      ]);
      setUsers(usersData.users);
      setReports(reportsData.reports);
      setColleges(collegesData.colleges);
      setSupportTickets(supportData.tickets || []);
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

  const loadTicketMessages = async (ticketId, isSilent = false) => {
    if (!isSilent) setLoadingMessages(true);
    try {
      const data = await api.support.getMessages(ticketId);
      setSelectedTicket(data.ticket);
      setTicketMessages(data.messages || []);
    } catch (err) {
      if (!isSilent) alert('Failed to load ticket messages: ' + err.message);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'support' || !selectedTicketId) return;
    loadTicketMessages(selectedTicketId);
    const interval = setInterval(() => {
      loadTicketMessages(selectedTicketId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, selectedTicketId]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollTop = chatMessagesEndRef.current.scrollHeight;
    }
  }, [ticketMessages]);

  const handleSelectTicket = (t) => {
    setSelectedTicketId(t.id);
    loadTicketMessages(t.id);
  };

  const handleSendSupportReply = async (e) => {
    e.preventDefault();
    if (!supportReply.trim() || !selectedTicketId || sendingSupportReply) return;
    setSendingSupportReply(true);
    try {
      const data = await api.support.sendMessage(selectedTicketId, supportReply);
      setTicketMessages((prev) => [...prev, data.message]);
      setSupportReply('');
      setSupportTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId
            ? {
                ...t,
                status: t.status === 'open' ? 'in_progress' : t.status,
                last_message: supportReply,
                last_message_at: new Date().toISOString(),
                last_message_is_admin: true,
              }
            : t
        )
      );
      if (selectedTicket && selectedTicket.status === 'open') {
        setSelectedTicket((prev) => ({ ...prev, status: 'in_progress' }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingSupportReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.support.updateStatus(ticketId, newStatus);
      setSelectedTicket((prev) => (prev?.id === ticketId ? { ...prev, status: newStatus } : prev));
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSupportTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to permanently delete this support ticket?')) return;
    try {
      await api.support.deleteTicket(ticketId);
      setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selectedTicketId === ticketId) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
        setTicketMessages([]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWarn = async (id, name) => {
    if (!window.confirm(`Are you sure you want to warn ${name}?`)) return;
    try {
      await api.admin.warnUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to ignore/delete this report?')) return;
    try {
      await api.admin.deleteReport(reportId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTakeDownPost = async (listingId, reportId) => {
    if (!window.confirm('Are you sure you want to take down this post permanently?')) return;
    try {
      await api.admin.deleteListing(listingId);
      await api.admin.deleteReport(reportId); // Also delete the report since the post is gone
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createCollege(newCollege);
      setNewCollege({ domain: '', name: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCollege = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete ${domain}? This will permanently delete all users and posts from this college.`)) return;
    try {
      await api.admin.deleteCollege(domain);
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
    <div className="bg-cw-surface rounded-xl border border-cw-border overflow-hidden">
      <table className="w-full text-left text-sm text-cw-text-2">
        <thead className="bg-cw-bg-alt text-xs uppercase text-cw-text-3">
          <tr>
            <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold">User</th>
            <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold">Roll No</th>
            <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold">Warnings</th>
            <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold">Trust Score</th>
            <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cw-border">
          {userList.map(u => (
            <tr key={u.id} className="hover:bg-cw-bg-alt/50 transition-colors">
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="font-medium text-cw-text-1 truncate max-w-[200px]">{u.full_name || 'Anonymous'}</div>
                <div className="text-xs text-cw-text-3 truncate max-w-[200px]">{u.email}</div>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-xs">{u.roll_number || '-'}</td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.warnings_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-cw-bg text-cw-text-3'}`}>
                  {u.warnings_count || 0}
                </span>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                {u.rating_average ? Number(u.rating_average).toFixed(1) : '-'} <span className="text-xs text-cw-text-3">({u.rating_count})</span>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-right space-x-2">
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

            {r.listing_id && (
              <div className="mt-4 p-3 bg-cw-bg-alt/50 rounded-lg border border-cw-border">
                <p className="text-xs font-semibold text-cw-text-3 uppercase tracking-wider mb-1">Reported Post</p>
                <p className="text-sm font-medium text-cw-text-1">
                  {r.listing_title ? `"${r.listing_title}"` : <span className="italic text-cw-text-3">Post already deleted</span>}
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-cw-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
              <div className="text-cw-text-2">
                Reported <span className="font-semibold text-cw-text-1">{r.reported_name || r.reported_email}</span>
                {' by '}
                <span className="font-semibold text-cw-text-1">{r.reporter_name || r.reporter_email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openActionModal({ id: r.reported_user_id, full_name: r.reported_name, email: r.reported_email }, 'warn')}
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  Warn User
                </button>
                {r.listing_id && r.listing_title && (
                  <button
                    onClick={() => handleTakeDownPost(r.listing_id, r.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Take Down Post
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReport(r.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cw-bg-alt text-cw-text-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Ignore
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCollegesTab = () => (
    <div className="space-y-6">
      <div className="bg-cw-surface p-6 rounded-xl border border-cw-border">
        <h3 className="text-lg font-semibold text-cw-text-1 mb-4">Add a New College</h3>
        <form onSubmit={handleAddCollege} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-cw-text-2 mb-1">College Domain (e.g., stanford.edu)</label>
            <input
              type="text"
              required
              className="field w-full"
              value={newCollege.domain}
              onChange={e => setNewCollege({ ...newCollege, domain: e.target.value.toLowerCase() })}
              placeholder="harvard.edu"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-cw-text-2 mb-1">College Name</label>
            <input
              type="text"
              required
              className="field w-full"
              value={newCollege.name}
              onChange={e => setNewCollege({ ...newCollege, name: e.target.value })}
              placeholder="Harvard University"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary py-2 px-6">Add</button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto bg-cw-surface rounded-xl border border-cw-border">
        <table className="w-full text-left text-sm text-cw-text-2">
          <thead className="bg-cw-bg-alt text-xs uppercase text-cw-text-3">
            <tr>
              <th className="px-6 py-4 font-semibold">Domain</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cw-border">
            {colleges.map(c => (
              <tr key={c.id} className="hover:bg-cw-bg-alt/50 transition-colors">
                <td className="px-6 py-4 font-medium text-cw-text-1 whitespace-nowrap">@{c.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteCollege(c.domain)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {colleges.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-cw-text-3">No colleges found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const openTicketsCount = supportTickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;

  const filteredTickets = supportTickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (t.subject || '').toLowerCase().includes(q) ||
      (t.user?.full_name || '').toLowerCase().includes(q) ||
      (t.user?.email || '').toLowerCase().includes(q) ||
      (t.user?.roll_number || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q);

    if (supportStatusFilter === 'all') return matchesQuery;
    return matchesQuery && t.status === supportStatusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'in_progress':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30';
      case 'resolved':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      case 'closed':
      default:
        return 'bg-cw-bg-alt text-cw-text-3 border border-cw-border';
    }
  };

  const getCategoryLabel = (category) => {
    const map = {
      account: 'Account & Verification',
      payment_dispute: 'Payment / Dispute',
      bug_report: 'Bug Report',
      feature_request: 'Feature Request',
      listing_help: 'Listing & Bids',
      general: 'General Inquiry',
      other: 'Other',
    };
    return map[category] || category;
  };

  const renderSupportTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex flex-col gap-2">
            <input
              type="search"
              placeholder="Search by student, subject, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field w-full text-sm"
            />
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSupportStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                    supportStatusFilter === filter
                      ? 'bg-cw-accent text-white shadow-sm'
                      : 'bg-cw-surface hover:bg-cw-bg-alt text-cw-text-2 border border-cw-border'
                  }`}
                >
                  {filter === 'all'
                    ? `All (${supportTickets.length})`
                    : `${filter.replace('_', ' ')} (${
                        supportTickets.filter((t) => t.status === filter).length
                      })`}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="card text-center py-12 text-sm text-cw-text-3">
                No support tickets found matching your filter.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`card p-4 cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'border-cw-accent shadow-md bg-cw-accent/5'
                        : 'border-cw-border hover:border-cw-accent/40 hover:bg-cw-bg-alt/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-cw-text-3 whitespace-nowrap">
                        {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-cw-text-1 line-clamp-1 mb-1">
                      {ticket.subject}
                    </h4>

                    <p className="text-xs text-cw-text-2 line-clamp-2 mb-3">
                      {ticket.last_message || ticket.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-cw-text-3 pt-2 border-t border-cw-border/60">
                      <span className="font-medium text-cw-text-1 truncate max-w-[160px]">
                        {ticket.user?.full_name || 'Student'}
                        {ticket.user?.roll_number ? ` • ${ticket.user.roll_number}` : ''}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-cw-accent">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat & Ticket Management */}
        <div className="lg:col-span-7">
          {!selectedTicketId ? (
            <div className="card h-[620px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-cw-border">
              <div className="w-16 h-16 rounded-2xl bg-cw-bg-alt text-3xl flex items-center justify-center mb-4">
                💬
              </div>
              <h3 className="text-lg font-semibold text-cw-text-1 mb-1">Support Live Desk</h3>
              <p className="text-sm text-cw-text-2 max-w-sm">
                Select any support ticket on the left to read student queries, view attached proof, and chat in real-time.
              </p>
            </div>
          ) : (
            <div className="card h-[620px] flex flex-col p-0 overflow-hidden border border-cw-border shadow-sm">
              {/* Header */}
              <div className="p-4 border-b border-cw-border bg-cw-bg-alt/70 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-cw-text-1 truncate">
                      {selectedTicket?.subject || 'Support Ticket'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadge(
                        selectedTicket?.status || 'open'
                      )}`}
                    >
                      {(selectedTicket?.status || 'open').replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-cw-text-2 mt-0.5">
                    From:{' '}
                    <span className="font-semibold text-cw-text-1">
                      {selectedTicket?.creator?.full_name || selectedTicket?.user?.full_name || 'Student'}
                    </span>{' '}
                    ({selectedTicket?.creator?.email || selectedTicket?.user?.email})
                    {selectedTicket?.creator?.roll_number && (
                      <span className="ml-1 text-cw-text-3">• Roll: {selectedTicket.creator.roll_number}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket?.status || 'open'}
                    onChange={(e) => handleUpdateTicketStatus(selectedTicketId, e.target.value)}
                    className="field text-xs py-1.5 px-2 bg-cw-surface font-medium cursor-pointer"
                  >
                    <option value="open">Status: Open</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="resolved">Status: Resolved</option>
                    <option value="closed">Status: Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteSupportTicket(selectedTicketId)}
                    title="Delete ticket"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Initial Issue Details Pill/Accordion */}
              <div className="px-4 py-2.5 bg-cw-bg border-b border-cw-border text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-cw-text-2 truncate">
                  <span className="font-semibold text-cw-accent uppercase text-[10px] tracking-wider">
                    {getCategoryLabel(selectedTicket?.category)}
                  </span>
                  <span className="text-cw-border">|</span>
                  <span className="truncate">{selectedTicket?.description}</span>
                </div>
                {selectedTicket?.proof_url && (
                  <button
                    onClick={() => setFullscreenImage(selectedTicket.proof_url)}
                    className="text-xs font-semibold text-cw-accent hover:underline whitespace-nowrap flex items-center gap-1"
                  >
                    📷 View Proof
                  </button>
                )}
              </div>

              {/* Chat Message Stream */}
              <div
                ref={chatMessagesEndRef}
                className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-cw-surface"
              >
                {loadingMessages && ticketMessages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-cw-text-3">
                    Loading conversation...
                  </div>
                ) : ticketMessages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-cw-text-3">
                    No messages yet in this ticket.
                  </div>
                ) : (
                  ticketMessages.map((msg) => {
                    const isAdmin = msg.is_admin;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-cw-text-2">
                            {isAdmin ? '🛡️ Support Admin' : msg.sender?.full_name || 'Student'}
                          </span>
                          <span className="text-[10px] text-cw-text-3">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? 'bg-freelance text-white rounded-tr-sm shadow-sm'
                              : 'bg-cw-bg-alt border border-cw-border text-cw-text-1 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {msg.attachment_url && (
                          <div className="mt-2">
                            <img
                              src={msg.attachment_url}
                              alt="Attachment"
                              onClick={() => setFullscreenImage(msg.attachment_url)}
                              className="max-h-36 rounded-lg border border-cw-border object-cover cursor-zoom-in"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendSupportReply}
                className="p-3 border-t border-cw-border bg-cw-bg-alt/50 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type reply to student..."
                  value={supportReply}
                  onChange={(e) => setSupportReply(e.target.value)}
                  disabled={sendingSupportReply}
                  className="flex-1 field py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={!supportReply.trim() || sendingSupportReply}
                  className="btn-primary py-2 px-5 whitespace-nowrap text-sm"
                >
                  {sendingSupportReply ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
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
        <nav className="-mb-px flex flex-wrap gap-4 sm:gap-8 px-2 sm:px-0">
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
          <button
            onClick={() => { setActiveTab('support'); setSearchQuery(''); }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'support'
                ? 'border-cw-accent text-cw-accent'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
              }`}
          >
            Support Chats ({openTicketsCount})
            {openTicketsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-cw-accent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('colleges'); setSearchQuery(''); }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'colleges'
                ? 'border-cw-accent text-cw-accent'
                : 'border-transparent text-cw-text-2 hover:text-cw-text-1 hover:border-cw-border'
              }`}
          >
            Assigned Colleges ({colleges.length})
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
          {activeTab === 'support' && renderSupportTab()}
          {activeTab === 'colleges' && renderCollegesTab()}
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
