import { useState, useEffect } from 'react';
import { Search, Users, MapPin, ClipboardList, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import leadService from '../../services/leadService';
import { getInitials, formatDate, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { LEAD_STATUS_BADGE, LEAD_STATUS_LABELS } from '../../utils/constants';

const ViewAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentLeads, setAgentLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userService.getManagerAgents();
        setAgents(res.data || []);
      } catch (err) {
        toast.error('Failed to load agents');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleViewLeads = async (agent) => {
    setSelectedAgent(agent);
    setLeadsLoading(true);
    try {
      const res = await leadService.getLeadsByAgent(agent.email);
      setAgentLeads(res.data || []);
    } catch (err) {
      toast.error('Failed to load agent leads');
    } finally { setLeadsLoading(false); }
  };

  const filtered = agents.filter(a =>
    `${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Agents</h1>
          <p className="page-subtitle">{agents.length} agents assigned to you</p>
        </div>
      </div>

      <div className={selectedAgent ? "grid-2" : ""} style={{ gap: 20 }}>
        {/* Agents List */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
            <div className="search-bar">
              <Search size={15} color="#9aa5b1" />
              <input placeholder="Search agents…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={24} /></div>
              <p style={{ fontWeight: 600, color: '#4a5568' }}>No agents found</p>
              <p style={{ fontSize: 13, color: '#9aa5b1' }}>Ask admin to assign agents to you</p>
            </div>
          ) : (
            <div>
              {filtered.map(agent => (
                <div key={agent.id}
                  onClick={() => handleViewLeads(agent)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer',
                    background: selectedAgent?.id === agent.id ? '#f0f5fb' : 'white',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = '#f8f9fa'; }}
                  onMouseLeave={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = 'white'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar avatar-primary" style={{ width: 42, height: 42, fontSize: 16 }}>
                      {getInitials(agent.name)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#0f1923' }}>{agent.name}</p>
                      <p style={{ fontSize: 12, color: '#9aa5b1' }}>{agent.email}</p>
                      {agent.address?.city && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={11} color="#9aa5b1" />
                          <span style={{ fontSize: 12, color: '#9aa5b1' }}>{agent.address.city}, {agent.address.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#1a3c5e', fontFamily: 'var(--font-display)' }}>{agent.leadCount ?? 0}</p>
                      <p style={{ fontSize: 11, color: '#9aa5b1' }}>leads</p>
                    </div>
                    <ChevronRight size={16} color={selectedAgent?.id === agent.id ? '#1a3c5e' : '#9aa5b1'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Leads Panel */}
        {selectedAgent && (
          <div className="card" style={{ padding: 0, animation: 'slideIn 0.25s ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar avatar-accent">{getInitials(selectedAgent.name)}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>{selectedAgent.name}'s Leads</h3>
                  <p style={{ fontSize: 12, color: '#9aa5b1' }}>{agentLeads.length} assigned</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa5b1', fontSize: 18 }}>✕</button>
            </div>

            {leadsLoading ? <LoadingSpinner /> : agentLeads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><ClipboardList size={22} /></div>
                <p style={{ fontWeight: 600, color: '#4a5568' }}>No leads assigned yet</p>
                <button onClick={() => navigate('/manager/leads')} className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Assign Leads
                </button>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>Client</th><th>Property</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {agentLeads.map(lead => (
                      <tr key={lead.id}>
                        <td style={{ fontWeight: 500, fontSize: 14 }}>{lead.name}</td>
                        <td style={{ fontSize: 13, color: '#4a5568' }}>{lead.propertyType}</td>
                        <td><span className={`badge ${LEAD_STATUS_BADGE[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</span></td>
                        <td style={{ fontSize: 12, color: '#9aa5b1' }}>{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAgents;
