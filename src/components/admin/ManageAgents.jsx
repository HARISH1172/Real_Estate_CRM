import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Users, UserCheck, UserMinus, Clock, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import { formatDate, getInitials, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const statusTabs = ['ALL', 'PENDING', 'APPROVED'];

const ManageAgents = () => {
  const [agents, setAgents]   = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const load = async () => {
    try {
      const [agentsRes, managersRes] = await Promise.all([
        userService.getAgents(),
        userService.getManagers()
      ]);
      
      // Update status mapping if backend uses different field or logic
      // Assuming backend User entity has 'approved' boolean and 'role' enum
      setAgents(agentsRes.data || []); 
      setManagers(managersRes.data || []);
    } catch (err) {
      toast.error('Failed to load agents or managers');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = agents.filter(a => {
    const matchTab    = activeTab === 'ALL' || a.status === activeTab;
    const matchSearch = `${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleApprove = async (agentEmail, managerEmail) => {
    if (!managerEmail) { toast.error('Please select a manager first'); return; }
    try {
      await userService.approveAgent(agentEmail, managerEmail);
      const m = managers.find(man => man.email === managerEmail);
      setAgents(p => p.map(a => a.email === agentEmail ? { ...a, status: 'APPROVED', managerEmail, managerName: m?.name || managerEmail } : a));
      toast.success('Agent approved and assigned!');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleDelete = async (email) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userService.deleteUser(email);
      setAgents(p => p.filter(a => a.email !== email));
      toast.success('User deleted');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const badgeClass = (s) => ({ PENDING: 'badge-warning', APPROVED: 'badge-success' }[s] || 'badge-muted');
  const counts     = { ALL: agents.length, PENDING: agents.filter(a => a.status === 'PENDING').length, APPROVED: agents.filter(a => a.status === 'APPROVED').length };

  const handleUnassignManager = async (agentEmail) => {
    if (!window.confirm('Unassign manager from this agent?')) return;
    try {
      await userService.assignManagerToAgent(agentEmail, '');
      setAgents(prev => prev.map(a => a.email === agentEmail ? { ...a, managerEmail: '', managerName: '' } : a));
      toast.success('Manager unassigned!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  
  const handleUpdateAssignment = async (agentEmail, managerEmail) => {
    if (!managerEmail) { toast.error('Select a manager'); return; }
    try {
      await userService.assignManagerToAgent(agentEmail, managerEmail);
      const m = managers.find(man => man.email === managerEmail);
      setAgents(prev => prev.map(a => a.email === agentEmail ? { ...a, managerEmail, managerName: m?.name || managerEmail } : a));
      toast.success('Manager assigned successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="page-subtitle">Manage agent registrations and manager assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-warning" style={{ alignItems: 'center', fontSize: 13, padding: '6px 12px' }}>
            <Clock size={12} /> {counts.PENDING} Pending
          </span>
          <span className="badge badge-success" style={{ alignItems: 'center', fontSize: 13, padding: '6px 12px' }}>
            <UserCheck size={12} /> {counts.APPROVED} Approved
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#f5f6fa', borderRadius: 10, padding: 4 }}>
            {statusTabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#0f1923' : '#9aa5b1', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                {tab}
                {counts[tab] > 0 && <span style={{ marginLeft: 5, background: activeTab === tab ? '#1a3c5e' : '#e8eaed', color: activeTab === tab ? 'white' : '#9aa5b1', borderRadius: 99, padding: '1px 6px', fontSize: 11 }}>{counts[tab]}</span>}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <Search size={15} color="#9aa5b1" />
            <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={24} /></div>
            <p style={{ fontWeight: 600, color: '#4a5568' }}>No agents found</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr>
                <th>Agent</th><th>Contact</th><th>City</th><th>Status</th><th>Assign Manager</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(agent => (
                  <tr key={agent.id}>
                    <td data-label="Agent">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-primary">{getInitials(agent.name)}</div>
                        <div>
                          <p style={{ fontWeight: 500 }}>{agent.name}</p>
                          <p style={{ fontSize: 12, color: '#9aa5b1' }}>{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Contact" style={{ color: '#4a5568', fontSize: 13 }}>{agent.phone}</td>
                    <td data-label="City">
                      {agent.address?.city && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4a5568' }}>
                          <MapPin size={12} color="#9aa5b1" /> {agent.address.city}
                        </div>
                      )}
                    </td>
                    <td data-label="Status"><span className={`badge ${badgeClass(agent.status)}`}>{agent.status}</span></td>
                    <td data-label="Manager">
                      {agent.status === 'APPROVED' && agent.managerName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="avatar avatar-primary" style={{ width: 22, height: 22, fontSize: 10 }}>{getInitials(agent.managerName || 'M')}</div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{agent.managerName || agent.managerEmail}</span>
                          <button onClick={() => handleUnassignManager(agent.email)} className="btn btn-ghost btn-sm" style={{ padding: 2, color: '#9aa5b1' }} title="Unassign Manager">
                            <UserMinus size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <select
                            value={agent.managerEmail || ''}
                            onChange={e => setAgents(p => p.map(a => a.email === agent.email ? { ...a, managerEmail: e.target.value } : a))}
                            style={{ border: '1.5px solid #e8eaed', borderRadius: 8, padding: '5px 10px', fontSize: 13, background: 'white', color: '#4a5568', cursor: 'pointer', outline: 'none' }}>
                            <option value="">Select Manager</option>
                            {managers.map(m => <option key={m.email} value={m.email}>{m.name}</option>)}
                          </select>
                          {agent.status === 'APPROVED' && agent.managerEmail && (
                            <button onClick={() => handleUpdateAssignment(agent.email, agent.managerEmail)} className="btn btn-primary btn-sm" style={{ padding: '0 8px' }}>Save</button>
                          )}
                        </div>
                      )}
                    </td>
                    <td data-label="Joined" style={{ color: '#9aa5b1', fontSize: 13 }}>{formatDate(agent.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                         {agent.status === 'PENDING' && <>
                          <button onClick={() => handleApprove(agent.email, agent.managerEmail)} className="btn btn-success btn-sm"><CheckCircle size={13} /> Approve</button>
                          <button onClick={() => handleDelete(agent.email)}  className="btn btn-danger btn-sm"><XCircle size={13} /> Reject</button>
                        </>}
                        {agent.status !== 'PENDING' && (
                          <button onClick={() => handleDelete(agent.email)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAgents;
